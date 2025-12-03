"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Typography, Stack, Box, Tabs, Tab } from "@mui/material";
import { motion } from "framer-motion";
import { FileText, Clock, Wallet, ArrowRight, Briefcase } from "lucide-react";
import { PageContainer, StatusChip, EmptyState, StyledCard, MetaItem, LoadingState } from "@/src/shared/ui";
import { getMyProposals, type Proposal, type ProposalStatus } from "@/src/shared/api/proposals";
import { useAuth } from "@/src/shared/lib/hooks";
import { toastService } from "@/src/shared/lib/toast";
import { formatPriceRange } from "@/src/shared/lib/utils";
import { formatTimeAgo } from "@/src/shared/lib/utils/date-utils";

const statusTabs = [
  { value: "all", label: "Все" },
  { value: "pending", label: "Ожидают" },
  { value: "accepted", label: "Принятые" },
  { value: "rejected", label: "Отклонённые" },
  { value: "withdrawn", label: "Отозванные" },
];

function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <Link href={`/orders/${proposal.order_id}`} style={{ textDecoration: "none" }}>
      <StyledCard interactive>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1 }}>
              {proposal.order?.title && (
                <Typography variant="subtitle1" fontWeight={600}>
                  {proposal.order.title}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: "var(--text-muted)", mt: 0.5 }}>
                {proposal.cover_letter?.slice(0, 150)}
                {(proposal.cover_letter?.length || 0) > 150 ? "..." : ""}
              </Typography>
            </Box>
            <StatusChip status={proposal.status} type="proposal" />
          </Stack>

          {/* Meta */}
          <Stack direction="row" spacing={3} flexWrap="wrap">
            {proposal.proposed_amount && (
              <MetaItem icon={Wallet} size="md">Ваша ставка: {formatPriceRange(proposal.proposed_amount)}</MetaItem>
            )}
            <MetaItem icon={Clock} size="md">{formatTimeAgo(proposal.created_at)}</MetaItem>
            {proposal.order?.status && (
              <MetaItem icon={Briefcase} size="md">Заказ: {proposal.order.status}</MetaItem>
            )}
          </Stack>

          {/* Action hint */}
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
            <Typography variant="caption" sx={{ color: "var(--primary)" }}>
              Перейти к заказу
            </Typography>
            <ArrowRight size={14} style={{ color: "var(--primary)" }} />
          </Stack>
        </Stack>
      </StyledCard>
    </Link>
  );
}

export default function ProposalsPage() {
  const router = useRouter();
  const { userRole, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toastService.warning("Необходимо авторизоваться");
        router.push("/auth/login");
        return;
      }
      if (userRole !== "freelancer") {
        toastService.error("Эта страница только для фрилансеров");
        router.push("/dashboard");
        return;
      }
      loadProposals();
    }
  }, [authLoading, isAuthenticated, userRole, router]);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await getMyProposals();
      setProposals(data || []);
    } catch {
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = statusFilter === "all"
    ? proposals
    : proposals.filter((p) => p.status === statusFilter);

  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === "pending").length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
  };

  if (authLoading) {
    return (
      <PageContainer title="Мои отклики" loading>
        <LoadingState type="list" count={3} height={140} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Мои отклики"
      subtitle={`Всего ${stats.total} откликов • ${stats.pending} ожидают • ${stats.accepted} принято`}
    >
      {/* Tabs */}
      <StyledCard sx={{ mb: 3 }} noPadding>
        <Tabs
          value={statusFilter}
          onChange={(_, v) => setStatusFilter(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {statusTabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </StyledCard>

      {/* Proposals List */}
      {loading ? (
        <LoadingState type="list" count={3} height={140} />
      ) : filteredProposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Нет откликов"
          description={
            statusFilter === "all"
              ? "Вы ещё не откликались на заказы. Найдите подходящий проект на бирже."
              : "Нет откликов с таким статусом"
          }
          action={statusFilter === "all" ? { label: "Найти заказы", href: "/orders" } : undefined}
        />
      ) : (
        <Stack spacing={2}>
          {filteredProposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProposalCard proposal={proposal} />
            </motion.div>
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
