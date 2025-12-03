"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Stack,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { PageContainer, StyledCard, EmptyState, LoadingState, StatusChip } from "@/src/shared/ui";
import { useAuth } from "@/src/shared/lib/hooks";
import { toastService } from "@/src/shared/lib/toast";
import { getBalance, deposit, getTransactions } from "@/src/shared/api/payments";
import { getWithdrawals, createWithdrawal } from "@/src/shared/api/withdrawals";
import type { UserBalance, Transaction } from "@/src/entities/payment/model/types";
import type { Withdrawal } from "@/src/entities/payment/model/types";
import dayjs from "dayjs";

const transactionTypeLabels: Record<string, { label: string; icon: typeof ArrowUpCircle; color: string }> = {
  deposit: { label: "Пополнение", icon: ArrowUpCircle, color: "var(--success)" },
  withdrawal: { label: "Вывод", icon: ArrowDownCircle, color: "var(--error)" },
  escrow_hold: { label: "Заморозка", icon: Clock, color: "var(--warning)" },
  escrow_release: { label: "Получение", icon: CheckCircle, color: "var(--success)" },
  escrow_refund: { label: "Возврат", icon: ArrowUpCircle, color: "var(--info)" },
};

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const config = transactionTypeLabels[transaction.type] || { label: transaction.type, icon: Clock, color: "var(--text-muted)" };
  const Icon = config.icon;
  const isPositive = ["deposit", "escrow_release", "escrow_refund"].includes(transaction.type);

  return (
    <StyledCard>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: `${config.color}20`, width: 40, height: 40 }}>
          <Icon size={20} style={{ color: config.color }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight={500}>{config.label}</Typography>
          <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 12 }}>
            {transaction.description || "—"} • {dayjs(transaction.created_at).format("DD.MM.YYYY HH:mm")}
          </Typography>
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ color: isPositive ? "var(--success)" : "var(--error)" }}
        >
          {isPositive ? "+" : "-"}{transaction.amount.toLocaleString()} ₽
        </Typography>
      </Stack>
    </StyledCard>
  );
}

function WithdrawalItem({ withdrawal }: { withdrawal: Withdrawal }) {
  return (
    <StyledCard>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", width: 40, height: 40 }}>
          <ArrowDownCircle size={20} style={{ color: "var(--error)" }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight={500}>
            Вывод на карту *{withdrawal.card_last4}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-muted)", fontSize: 12 }}>
            {withdrawal.bank_name} • {dayjs(withdrawal.created_at).format("DD.MM.YYYY HH:mm")}
          </Typography>
        </Box>
        <Stack alignItems="flex-end" spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "var(--error)" }}>
            -{withdrawal.amount.toLocaleString()} ₽
          </Typography>
          <StatusChip status={withdrawal.status} type="escrow" size="small" />
        </Stack>
      </Stack>
    </StyledCard>
  );
}

export default function WalletPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [tab, setTab] = useState(0);

  // Deposit dialog
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  // Withdrawal dialog
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [bankName, setBankName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toastService.warning("Необходимо авторизоваться");
        router.push("/auth/login");
        return;
      }
      loadData();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balanceData, transactionsData, withdrawalsData] = await Promise.all([
        getBalance(),
        getTransactions({ limit: 50 }),
        getWithdrawals({ limit: 50 }),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData.transactions || []);
      setWithdrawals(withdrawalsData || []);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toastService.error("Введите корректную сумму");
      return;
    }
    setDepositing(true);
    try {
      await deposit({ amount });
      toastService.success("Баланс пополнен");
      setDepositOpen(false);
      setDepositAmount("");
      loadData();
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка пополнения");
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 100) {
      toastService.error("Минимальная сумма вывода 100 ₽");
      return;
    }
    if (!cardLast4 || cardLast4.length !== 4) {
      toastService.error("Введите последние 4 цифры карты");
      return;
    }
    if (!bankName) {
      toastService.error("Введите название банка");
      return;
    }
    setWithdrawing(true);
    try {
      await createWithdrawal({ amount, card_last4: cardLast4, bank_name: bankName });
      toastService.success("Заявка на вывод создана");
      setWithdrawOpen(false);
      setWithdrawAmount("");
      setCardLast4("");
      setBankName("");
      loadData();
    } catch (error: any) {
      toastService.error(error.response?.data?.error || "Ошибка создания заявки");
    } finally {
      setWithdrawing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PageContainer title="Кошелёк">
        <LoadingState type="page" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Кошелёк" subtitle="Управление балансом и платежами">
      {/* Balance Card */}
      <StyledCard sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>Доступно</Typography>
            <Typography variant="h3" sx={{ color: "var(--text)", fontWeight: 700 }}>
              {balance?.available.toLocaleString() || 0} ₽
            </Typography>
            {balance?.frozen && balance.frozen > 0 && (
              <Typography variant="body2" sx={{ color: "var(--text-muted)", mt: 0.5 }}>
                Заморожено: {balance.frozen.toLocaleString()} ₽
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<ArrowUpCircle size={18} />}
              onClick={() => setDepositOpen(true)}
            >
              Пополнить
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowDownCircle size={18} />}
              onClick={() => setWithdrawOpen(true)}
            >
              Вывести
            </Button>
          </Stack>
        </Stack>
      </StyledCard>

      {/* Tabs */}
      <StyledCard sx={{ mb: 3 }} noPadding>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Транзакции" />
          <Tab label="Заявки на вывод" />
        </Tabs>
      </StyledCard>

      {/* Content */}
      {tab === 0 ? (
        transactions.length === 0 ? (
          <EmptyState icon={Wallet} title="Нет транзакций" description="История операций появится здесь" />
        ) : (
          <Stack spacing={1.5}>
            {transactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </Stack>
        )
      ) : (
        withdrawals.length === 0 ? (
          <EmptyState icon={ArrowDownCircle} title="Нет заявок" description="Заявки на вывод появятся здесь" />
        ) : (
          <Stack spacing={1.5}>
            {withdrawals.map((w) => (
              <WithdrawalItem key={w.id} withdrawal={w} />
            ))}
          </Stack>
        )
      )}

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onClose={() => setDepositOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Пополнение баланса</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Сумма (₽)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleDeposit} disabled={depositing}>
            {depositing ? <CircularProgress size={20} /> : "Пополнить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Вывод средств</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="number"
              label="Сумма (₽)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              helperText={`Минимум 100 ₽ • Доступно: ${balance?.available.toLocaleString() || 0} ₽`}
              InputProps={{
                endAdornment: balance?.available ? (
                  <Button size="small" onClick={() => setWithdrawAmount(String(balance.available))}>
                    Всё
                  </Button>
                ) : null,
              }}
            />
            <TextField
              fullWidth
              label="Последние 4 цифры карты"
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputProps={{ maxLength: 4 }}
            />
            <TextField
              fullWidth
              label="Название банка"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? <CircularProgress size={20} /> : "Создать заявку"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
