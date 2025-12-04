"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Avatar,
  CircularProgress,
  IconButton,
  Stack,
  Chip,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Popover,
  Alert,
} from "@mui/material";
import {
  ArrowLeft,
  Send,
  User,
  Briefcase,
  CheckCheck,
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Smile,
  Paperclip,
  Calendar,
  Banknote,
  ExternalLink,
  X,
  CheckCircle,
  AlertTriangle,
  Star,
} from "lucide-react";
import {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction,
} from "@/src/shared/api/conversations";
import { uploadPhoto } from "@/src/shared/api/media";
import { updateOrder } from "@/src/shared/api/orders";
import { canReview, createReview } from "@/src/shared/api/reviews";
import { useAuth } from "@/src/shared/lib/hooks";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import { toastService } from "@/src/shared/lib/toast";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import type { Message, MessagesResponse } from "@/src/entities/conversation/model/types";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

const EMOJIS = ["👍", "❤️", "😊", "😂", "😮", "😢", "🎉", "🔥"];

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [data, setData] = useState<MessagesResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [files, setFiles] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuMsg, setMenuMsg] = useState<Message | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState("");

  // Emoji picker
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [emojiMsg, setEmojiMsg] = useState<Message | null>(null);

  // Confirm order
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Review
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Image viewer
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const myId = user?.id ? String(user.id) : null;
  const isClient = myId && data?.conversation?.client_id === myId;
  const isFreelancer = myId && data?.conversation?.freelancer_id === myId;
  const isInProgress = data?.order?.status === "in_progress";
  const isCompleted = data?.order?.status === "completed";

  const scroll = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  // Load
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const res = await getMessages(id as string, { limit: 100 });
        console.log("Chat loaded, order status:", res.order?.status, "order id:", res.order?.id);
        setData(res);
        setMessages(res.messages || []);
        setTimeout(scroll, 100);
        
        // Check if can leave review
        if (res.order?.status === "completed" && res.order?.id) {
          try {
            const reviewCheck = await canReview(res.order.id);
            console.log("canReview response:", reviewCheck);
            setCanLeaveReview(reviewCheck.can_review);
          } catch (err) {
            console.log("canReview error:", err);
            // If API fails, still show the button - will check again on click
            setCanLeaveReview(true);
          }
        }
      } catch {
        toastService.error("Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    load();
    websocketService.connect().catch(() => {});

    const unsub = websocketService.on("chat.message", (ws) => {
      if (ws.data?.conversation?.id === id && ws.data?.message) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === ws.data.message.id)) return prev;
          return [...prev, ws.data.message];
        });
        setTimeout(scroll, 100);
      }
    });

    // Подписка на добавление реакций
    const unsubReactionAdded = websocketService.on("message.reaction.added", (ws) => {
      if (ws.data?.conversation_id === id && ws.data?.message_id) {
        const { message_id, reaction } = ws.data;
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === message_id && reaction) {
              let reactions: Record<string, string[]> = {};
              if (Array.isArray(m.reactions)) {
                m.reactions.forEach((r: any) => {
                  if (!reactions[r.emoji]) reactions[r.emoji] = [];
                  reactions[r.emoji].push(r.user_id);
                });
              } else if (m.reactions) {
                reactions = { ...(m.reactions as any) };
              }
              reactions[reaction.emoji] = [...(reactions[reaction.emoji] || []), reaction.user_id];
              return { ...m, reactions: reactions as any };
            }
            return m;
          })
        );
      }
    });

    // Подписка на удаление реакций
    const unsubReactionRemoved = websocketService.on("message.reaction.removed", (ws) => {
      if (ws.data?.conversation_id === id && ws.data?.message_id) {
        const { message_id, user_id } = ws.data;
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === message_id) {
              let reactions: Record<string, string[]> = {};
              if (Array.isArray(m.reactions)) {
                m.reactions.forEach((r: any) => {
                  if (!reactions[r.emoji]) reactions[r.emoji] = [];
                  reactions[r.emoji].push(r.user_id);
                });
              } else if (m.reactions) {
                reactions = { ...(m.reactions as any) };
              }
              Object.keys(reactions).forEach((emoji) => {
                if (Array.isArray(reactions[emoji])) {
                  reactions[emoji] = reactions[emoji].filter((uid: string) => uid !== user_id);
                  if (reactions[emoji].length === 0) delete reactions[emoji];
                }
              });
              return { ...m, reactions: reactions as any };
            }
            return m;
          })
        );
      }
    });

    // Подписка на обновления заказа
    const unsubOrder = websocketService.on("orders.updated", (ws) => {
      setData((prev) => {
        if (prev?.order?.id && ws.data?.order?.id === prev.order.id) {
          return { ...prev, order: ws.data.order };
        }
        return prev;
      });
    });

    return () => {
      unsub();
      unsubReactionAdded();
      unsubReactionRemoved();
      unsubOrder();
    };
  }, [id, user?.id]);

  // Send
  const send = async () => {
    if ((!text.trim() && files.length === 0) || sending) return;
    setSending(true);
    try {
      const res = await sendMessage(id as string, {
        content: text.trim(),
        parent_message_id: replyTo?.id,
        attachment_ids: files.length > 0 ? files.map((f) => f.id) : undefined,
      });
      setMessages((prev) => [...prev, res.message]);
      setText("");
      setReplyTo(null);
      setFiles([]);
      setTimeout(scroll, 100);
    } catch {
      toastService.error("Ошибка отправки");
    } finally {
      setSending(false);
    }
  };

  // Edit
  const saveEdit = async () => {
    if (!menuMsg || !editText.trim()) return;
    try {
      await updateMessage(id as string, menuMsg.id, { content: editText.trim() });
      setMessages((prev) =>
        prev.map((m) => (m.id === menuMsg.id ? { ...m, content: editText.trim(), updated_at: new Date().toISOString() } : m))
      );
      toastService.success("Изменено");
    } catch {
      toastService.error("Ошибка");
    }
    setEditOpen(false);
    setMenuMsg(null);
  };

  // Delete
  const del = async () => {
    if (!menuMsg) return;
    try {
      await deleteMessage(id as string, menuMsg.id);
      setMessages((prev) => prev.map((m) => (m.id === menuMsg.id ? { ...m, content: "[Удалено]" } : m)));
      toastService.success("Удалено");
    } catch {
      toastService.error("Ошибка");
    }
    setMenuAnchor(null);
    setMenuMsg(null);
  };

  // Reaction
  const react = async (emoji: string) => {
    if (!emojiMsg) return;
    try {
      await addReaction(id as string, emojiMsg.id, emoji);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === emojiMsg.id) {
            // Handle both array and object formats
            let reactions: Record<string, string[]> = {};
            if (Array.isArray(m.reactions)) {
              m.reactions.forEach((r: any) => {
                if (!reactions[r.emoji]) reactions[r.emoji] = [];
                reactions[r.emoji].push(r.user_id);
              });
            } else if (m.reactions && typeof m.reactions === "object") {
              reactions = { ...(m.reactions as Record<string, string[]>) };
            }
            // Удаляем старую реакцию этого пользователя
            Object.keys(reactions).forEach((e) => {
              if (Array.isArray(reactions[e])) {
                reactions[e] = reactions[e].filter((uid: string) => uid !== myId);
                if (reactions[e].length === 0) delete reactions[e];
              }
            });
            // Добавляем новую
            reactions[emoji] = [...(reactions[emoji] || []), myId!];
            return { ...m, reactions: reactions as any };
          }
          return m;
        })
      );
    } catch {
      toastService.error("Ошибка");
    }
    setEmojiAnchor(null);
    setEmojiMsg(null);
  };

  const unreact = async (msg: Message) => {
    try {
      await removeReaction(id as string, msg.id);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msg.id) {
            let reactions: Record<string, string[]> = {};
            if (Array.isArray(m.reactions)) {
              m.reactions.forEach((r: any) => {
                if (!reactions[r.emoji]) reactions[r.emoji] = [];
                reactions[r.emoji].push(r.user_id);
              });
            } else if (m.reactions) {
              reactions = { ...(m.reactions as any) };
            }
            Object.keys(reactions).forEach((e) => {
              if (Array.isArray(reactions[e])) {
                reactions[e] = reactions[e].filter((uid: string) => uid !== myId);
                if (reactions[e].length === 0) delete reactions[e];
              }
            });
            return { ...m, reactions: reactions as any };
          }
          return m;
        })
      );
    } catch {
      toastService.error("Ошибка");
    }
  };

  // Confirm order (client only)
  const handleConfirmOrder = async () => {
    if (!data?.order) return;
    setConfirming(true);
    try {
      await updateOrder(data.order.id, {
        title: data.order.title,
        description: data.order.description,
        status: "completed",
      });
      setData((prev) => prev ? { ...prev, order: { ...prev.order!, status: "completed" } } : prev);
      toastService.success("Заказ подтверждён! Средства переведены исполнителю.");
      setConfirmOpen(false);
      setCanLeaveReview(true); // Allow review after completion
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка подтверждения заказа");
    } finally {
      setConfirming(false);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!data?.order) return;
    setSubmittingReview(true);
    try {
      await createReview(data.order.id, {
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      toastService.success("Отзыв отправлен!");
      setReviewOpen(false);
      setCanLeaveReview(false);
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка отправки отзыва");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Open review dialog with check
  const handleOpenReview = async () => {
    if (!data?.order) return;
    try {
      const check = await canReview(data.order.id);
      if (check.can_review) {
        setReviewOpen(true);
      } else {
        toastService.info("Вы уже оставили отзыв");
        setCanLeaveReview(false);
      }
    } catch {
      setReviewOpen(true);
    }
  };

  // File upload
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toastService.warning("Макс 10МБ");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadPhoto(f);
      setFiles((prev) => [...prev, { id: res.id, name: f.name }]);
    } catch {
      toastService.error("Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isMine = (m: Message): boolean => !!(myId && m.author_id === myId);

  // Group by date
  const grouped: { date?: string; msg?: Message }[] = [];
  let lastD = "";
  messages.forEach((m) => {
    const d = dayjs(m.created_at).format("YYYY-MM-DD");
    if (d !== lastD) {
      grouped.push({ date: m.created_at });
      lastD = d;
    }
    grouped.push({ msg: m });
  });

  if (loading) {
    return (
      <Box sx={{ pt: 12, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ pt: 12, textAlign: "center" }}>
        <Typography color="text.secondary">Чат не найден</Typography>
      </Box>
    );
  }

  const other = data.other_user;
  const order = data.order;
  const avatar = other?.photo_url ? getMediaUrl(other.photo_url) : null;

  return (
    <Box sx={{ pt: "70px", height: "calc(100vh - 70px)", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden", px: 2, py: 1, gap: 2, maxWidth: 1000, mx: "auto", width: "100%", justifyContent: "center" }}>
        {/* CHAT */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 550,
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "var(--bg-elevated)",
            borderRadius: 3,
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderBottom: "1px solid var(--border)" }}>
            <IconButton size="small" onClick={() => router.push("/messages")}>
              <ArrowLeft size={20} />
            </IconButton>
            <Avatar 
              src={avatar || undefined} 
              sx={{ width: 36, height: 36, bgcolor: "var(--primary-10)", cursor: "pointer" }}
              onClick={() => other?.id && router.push(`/users/${other.id}`)}
            >
              {other?.display_name?.[0] || <User size={16} />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography 
                sx={{ fontWeight: 600, fontSize: 14, cursor: "pointer", "&:hover": { color: "var(--primary)" } }}
                onClick={() => other?.id && router.push(`/users/${other.id}`)}
              >
                {other?.display_name || "Пользователь"}
              </Typography>
              {order && (
                <Typography
                  sx={{ fontSize: 11, color: "var(--text-muted)", cursor: "pointer", "&:hover": { color: "var(--primary)" } }}
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  {order.title}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ color: "var(--text-muted)" }}>Начните диалог</Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {grouped.map((item, i) => {
                  if (item.date) {
                    const d = dayjs(item.date);
                    const label = d.isSame(dayjs(), "day") ? "Сегодня" : d.isSame(dayjs().subtract(1, "day"), "day") ? "Вчера" : d.format("D MMMM");
                    return (
                      <Box key={`d-${i}`} sx={{ textAlign: "center", py: 1 }}>
                        <Chip label={label} size="small" sx={{ fontSize: 11 }} />
                      </Box>
                    );
                  }

                  const m = item.msg!;
                  const mine = isMine(m);
                  const parent = replyTo?.id === m.parent_message_id ? replyTo : messages.find((x) => x.id === m.parent_message_id);

                  return (
                    <Box key={m.id} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <Box sx={{ maxWidth: "70%" }}>
                        {/* Bubble */}
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: mine ? "var(--primary)" : "var(--bg-secondary)",
                            border: mine ? "none" : "1px solid var(--border)",
                            position: "relative",
                          }}
                        >
                          {/* Reply preview */}
                          {parent && (
                            <Box sx={{ mb: 1, pl: 1, borderLeft: "2px solid", borderColor: mine ? "rgba(255,255,255,0.5)" : "var(--primary)", opacity: 0.8 }}>
                              <Typography sx={{ fontSize: 11, color: mine ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}>
                                {parent.content.slice(0, 40)}...
                              </Typography>
                            </Box>
                          )}

                          <Typography sx={{ fontSize: 13, color: mine ? "#fff" : "var(--text)", whiteSpace: "pre-wrap" }}>
                            {m.content}
                          </Typography>

                          {/* Attachments */}
                          {m.attachments?.map((a) => {
                            const url = getMediaUrl(a.media.file_path);
                            const isImage = a.media.file_type?.startsWith("image/") || 
                              /\.(jpg|jpeg|png|gif|webp)$/i.test(a.media.file_path);
                            
                            return isImage ? (
                              <Box key={a.id} sx={{ mt: 1 }}>
                                <img
                                  src={url || ""}
                                  alt="attachment"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: 200,
                                    borderRadius: 8,
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setViewerImage(url)}
                                />
                              </Box>
                            ) : (
                              <a
                                key={a.id}
                                href={url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "block", marginTop: 8, color: mine ? "#fff" : "var(--primary)", fontSize: 12 }}
                              >
                                📎 {a.media.file_path.split("/").pop()}
                              </a>
                            );
                          })}

                          {/* Time + menu */}
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.5 }}>
                            <Typography sx={{ fontSize: 10, color: mine ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>
                              {dayjs(m.created_at).format("HH:mm")}
                              {m.updated_at && " (изм.)"}
                            </Typography>
                            {mine && <CheckCheck size={12} style={{ color: "rgba(255,255,255,0.7)" }} />}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setMenuAnchor(e.currentTarget);
                                setMenuMsg(m);
                              }}
                              sx={{ ml: 0.5, p: 0.25 }}
                            >
                              <MoreVertical size={14} style={{ color: mine ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }} />
                            </IconButton>
                          </Stack>
                        </Box>

                        {/* Reactions */}
                        {m.reactions && (Array.isArray(m.reactions) ? m.reactions.length > 0 : Object.keys(m.reactions).length > 0) && (
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {(() => {
                              // Convert to object format
                              let reactionsObj: Record<string, string[]> = {};
                              if (Array.isArray(m.reactions)) {
                                m.reactions.forEach((r: any) => {
                                  if (!reactionsObj[r.emoji]) reactionsObj[r.emoji] = [];
                                  reactionsObj[r.emoji].push(r.user_id);
                                });
                              } else {
                                reactionsObj = m.reactions as any;
                              }
                              return Object.entries(reactionsObj).map(([emoji, userIds]) => {
                                const ids = Array.isArray(userIds) ? userIds : [];
                                const count = ids.length;
                                if (count === 0) return null;
                                const myR = ids.includes(myId!);
                                return (
                                  <Chip
                                    key={emoji}
                                    label={`${emoji} ${count}`}
                                    size="small"
                                    onClick={() => (myR ? unreact(m) : null)}
                                    sx={{
                                      fontSize: 11,
                                      height: 22,
                                    cursor: "pointer",
                                    bgcolor: myR ? "var(--primary-10)" : "var(--bg-secondary)",
                                    border: myR ? "1px solid var(--primary)" : "1px solid var(--border)",
                                  }}
                                />
                              );
                            });
                            })()}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setEmojiAnchor(e.currentTarget);
                                setEmojiMsg(m);
                              }}
                              sx={{ p: 0.25 }}
                            >
                              <Smile size={14} />
                            </IconButton>
                          </Stack>
                        )}
                      </Box>
                    </Box>
                  );
                })}
                <div ref={bottomRef} />
              </Stack>
            )}
          </Box>

          {/* Mobile action blocks */}
          {order && (
            <Box sx={{ display: { xs: "block", lg: "none" }, px: 2, pt: 1 }}>
              {/* Confirm order for client */}
              {isClient && isInProgress && (
                <Box sx={{ p: 1.5, mb: 1, bgcolor: "var(--primary-10)", borderRadius: 2, border: "1px solid var(--primary)" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Подтвердить заказ</Typography>
                      <Typography sx={{ fontSize: 10, color: "var(--text-muted)" }}>
                        Средства будут переведены исполнителю
                      </Typography>
                    </Box>
                    <Button size="small" variant="contained" onClick={() => setConfirmOpen(true)}>
                      Подтвердить
                    </Button>
                  </Stack>
                </Box>
              )}
              {/* Review block */}
              {isCompleted && (isClient || isFreelancer) && canLeaveReview && (
                <Box sx={{ p: 1.5, mb: 1, bgcolor: "var(--success-10)", borderRadius: 2, border: "1px solid var(--success)" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Star size={18} style={{ color: "var(--warning)" }} />
                    <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600 }}>
                      Оставьте отзыв о {isClient ? "исполнителе" : "заказчике"}
                    </Typography>
                    <Button size="small" variant="contained" onClick={handleOpenReview}>
                      Отзыв
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          {/* Input */}
          <Box sx={{ p: 2, borderTop: "1px solid var(--border)" }}>
            {replyTo && (
              <Stack direction="row" alignItems="center" sx={{ mb: 1, p: 1, bgcolor: "var(--bg-secondary)", borderRadius: 1 }}>
                <Reply size={14} style={{ marginRight: 8 }} />
                <Typography sx={{ flex: 1, fontSize: 12, color: "var(--text-muted)" }}>{replyTo.content.slice(0, 50)}...</Typography>
                <IconButton size="small" onClick={() => setReplyTo(null)}>
                  <X size={14} />
                </IconButton>
              </Stack>
            )}

            {files.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                {files.map((f) => (
                  <Chip
                    key={f.id}
                    label={f.name}
                    size="small"
                    onDelete={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                  />
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={1} alignItems="flex-end">
              <input ref={fileInputRef} type="file" hidden onChange={handleFile} />
              <IconButton onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <CircularProgress size={20} /> : <Paperclip size={20} />}
              </IconButton>
              <TextField
                fullWidth
                size="small"
                placeholder="Сообщение..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                multiline
                maxRows={4}
              />
              <IconButton
                onClick={send}
                disabled={(!text.trim() && files.length === 0) || sending}
                sx={{
                  bgcolor: text.trim() || files.length > 0 ? "var(--primary)" : undefined,
                  color: text.trim() || files.length > 0 ? "#fff" : undefined,
                }}
              >
                {sending ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
              </IconButton>
            </Stack>
          </Box>
        </Box>

        {/* ORDER INFO */}
        <Box
          sx={{
            width: 320,
            flexShrink: 0,
            maxHeight: "70vh",
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            bgcolor: "var(--bg-elevated)",
            borderRadius: 3,
            border: "1px solid var(--border)",
            overflow: "auto",
          }}
        >
          {order ? (
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Briefcase size={16} style={{ color: "var(--primary)" }} />
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>О заказе</Typography>
                  </Stack>
                  <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 1 }}>{order.title}</Typography>
                  <Chip
                    label={order.status === "in_progress" ? "В работе" : order.status === "completed" ? "Завершён" : order.status}
                    size="small"
                    color={order.status === "completed" ? "success" : order.status === "in_progress" ? "info" : "default"}
                  />
                </Box>

                {/* Confirm order button for client */}
                {isClient && isInProgress && (
                  <Box sx={{ p: 1.5, bgcolor: "var(--primary-10)", borderRadius: 2, border: "1px solid var(--primary)" }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<CheckCircle size={18} />}
                      onClick={() => setConfirmOpen(true)}
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Подтвердить заказ
                    </Button>
                    <Stack direction="row" spacing={0.5} alignItems="flex-start">
                      <AlertTriangle size={14} style={{ color: "var(--warning)", marginTop: 2, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                        Зарезервированная сумма будет переведена исполнителю
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Review block */}
                {isCompleted && (isClient || isFreelancer) && canLeaveReview && (
                  <Box sx={{ p: 1.5, bgcolor: "var(--success-10)", borderRadius: 2, border: "1px solid var(--success)" }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Star size={18} style={{ color: "var(--warning)" }} />
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Оставьте отзыв</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 11, color: "var(--text-muted)", mb: 1.5 }}>
                      Поделитесь впечатлениями о работе с {isClient ? "исполнителем" : "заказчиком"}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={<Star size={16} />}
                      onClick={handleOpenReview}
                      sx={{ fontWeight: 600 }}
                    >
                      Написать отзыв
                    </Button>
                  </Box>
                )}

                {order.description && (
                  <Box>
                    <Typography sx={{ fontSize: 11, color: "var(--text-muted)", mb: 0.5 }}>Описание</Typography>
                    <Typography 
                      sx={{ 
                        fontSize: 13,
                        ...(!showFullDesc && {
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        })
                      }}
                    >
                      {order.description}
                    </Typography>
                    {order.description.length > 80 && (
                      <Button 
                        size="small" 
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        sx={{ mt: 0.5, p: 0, minWidth: 0, fontSize: 12 }}
                      >
                        {showFullDesc ? "Скрыть" : "Показать всё"}
                      </Button>
                    )}
                  </Box>
                )}

                {(order.budget_min || order.budget_max) && (
                  <Box sx={{ p: 1.5, bgcolor: "var(--bg-secondary)", borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Banknote size={18} style={{ color: "var(--success)" }} />
                      <Box>
                        <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>Бюджет</Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "var(--success)" }}>
                          {order.budget_min?.toLocaleString()} - {order.budget_max?.toLocaleString()} ₽
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {order.deadline_at && (
                  <Box sx={{ p: 1.5, bgcolor: "var(--bg-secondary)", borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Calendar size={18} style={{ color: "var(--primary)" }} />
                      <Box>
                        <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>Дедлайн</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{dayjs(order.deadline_at).format("D MMMM YYYY")}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {order.accepted_proposal?.proposed_amount && (
                  <Box sx={{ p: 1.5, bgcolor: "var(--primary-10)", borderRadius: 2, border: "1px solid var(--primary)" }}>
                    <Typography sx={{ fontSize: 11, color: "var(--text-muted)", mb: 0.5 }}>Согласованная сумма</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>
                      {order.accepted_proposal.proposed_amount.toLocaleString()} ₽
                    </Typography>
                  </Box>
                )}

                {order.requirements && order.requirements.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: 11, color: "var(--text-muted)", mb: 1 }}>Требования</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {order.requirements.map((r) => (
                        <Chip key={r.id} label={`${r.skill} (${r.level})`} size="small" />
                      ))}
                    </Stack>
                  </Box>
                )}

                {order.attachments && order.attachments.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: 11, color: "var(--text-muted)", mb: 1 }}>Файлы</Typography>
                    <Stack spacing={0.5}>
                      {order.attachments.map((a) => (
                        <a
                          key={a.id}
                          href={a.media ? getMediaUrl(a.media.file_path) || "#" : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: 8,
                            background: "var(--bg-secondary)",
                            borderRadius: 4,
                            fontSize: 12,
                            color: "var(--text)",
                            textDecoration: "none",
                          }}
                        >
                          📎 {a.media?.file_path.split("/").pop() || "Файл"}
                        </a>
                      ))}
                    </Stack>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  startIcon={<ExternalLink size={16} />}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  fullWidth
                >
                  Открыть заказ
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography sx={{ color: "var(--text-muted)" }}>Нет информации о заказе</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Message menu */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            setReplyTo(menuMsg);
            setMenuAnchor(null);
          }}
        >
          <Reply size={16} style={{ marginRight: 8 }} /> Ответить
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            setEmojiAnchor(e.currentTarget);
            setEmojiMsg(menuMsg);
            setMenuAnchor(null);
          }}
        >
          <Smile size={16} style={{ marginRight: 8 }} /> Реакция
        </MenuItem>
        {menuMsg && isMine(menuMsg) && (
          <>
            <MenuItem
              onClick={() => {
                setEditText(menuMsg?.content || "");
                setEditOpen(true);
                setMenuAnchor(null);
              }}
            >
              <Edit size={16} style={{ marginRight: 8 }} /> Редактировать
            </MenuItem>
            <MenuItem onClick={del} sx={{ color: "error.main" }}>
              <Trash2 size={16} style={{ marginRight: 8 }} /> Удалить
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Emoji picker */}
      <Popover anchorEl={emojiAnchor} open={!!emojiAnchor} onClose={() => setEmojiAnchor(null)}>
        <Stack direction="row" spacing={0.5} sx={{ p: 1 }}>
          {EMOJIS.map((e) => (
            <IconButton key={e} onClick={() => react(e)} sx={{ fontSize: 20 }}>
              {e}
            </IconButton>
          ))}
        </Stack>
      </Popover>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} value={editText} onChange={(e) => setEditText(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={saveEdit}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm order dialog */}
      <Dialog open={confirmOpen} onClose={() => !confirming && setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Подтвердить выполнение заказа?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              Внимание! После подтверждения зарезервированная сумма будет переведена исполнителю.
            </Typography>
          </Alert>
          <DialogContentText>
            Убедитесь, что работа выполнена в полном объёме и соответствует вашим требованиям. Это действие нельзя отменить.
          </DialogContentText>
          {order?.accepted_proposal?.proposed_amount && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: "var(--bg-secondary)", borderRadius: 2 }}>
              <Typography sx={{ fontSize: 12, color: "var(--text-muted)" }}>Сумма к переводу:</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: "var(--success)" }}>
                {order.accepted_proposal.proposed_amount.toLocaleString()} ₽
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={confirming}>
            Отмена
          </Button>
          <Button variant="contained" color="success" onClick={handleConfirmOrder} disabled={confirming}>
            {confirming ? <CircularProgress size={20} color="inherit" /> : "Подтвердить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review dialog */}
      <Dialog open={reviewOpen} onClose={() => !submittingReview && setReviewOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Оставить отзыв</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "var(--text-muted)", mb: 2 }}>
            Оцените работу с {isClient ? "исполнителем" : "заказчиком"}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                onClick={() => setReviewRating(star)}
                sx={{ p: 0.5 }}
              >
                <Star
                  size={32}
                  fill={star <= reviewRating ? "var(--warning)" : "none"}
                  color={star <= reviewRating ? "var(--warning)" : "var(--text-muted)"}
                />
              </IconButton>
            ))}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Комментарий (необязательно)"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)} disabled={submittingReview}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSubmitReview} disabled={submittingReview}>
            {submittingReview ? <CircularProgress size={20} color="inherit" /> : "Отправить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image viewer */}
      {viewerImage && (
        <Dialog 
          open={true} 
          onClose={() => setViewerImage(null)} 
          maxWidth={false}
          PaperProps={{
            sx: { bgcolor: "transparent", boxShadow: "none", m: 1 }
          }}
        >
          <Box sx={{ position: "relative" }}>
            <IconButton
              onClick={() => setViewerImage(null)}
              sx={{ 
                position: "absolute", 
                top: 8, 
                right: 8, 
                bgcolor: "rgba(0,0,0,0.5)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" }
              }}
            >
              <X size={20} />
            </IconButton>
            <img
              src={viewerImage}
              alt="preview"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </Box>
        </Dialog>
      )}
    </Box>
  );
}
