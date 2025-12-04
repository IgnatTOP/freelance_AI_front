"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  InputAdornment,
  Collapse,
  FormControl,
  InputLabel,
  Autocomplete,
  OutlinedInput,
} from "@mui/material";
import { Search, Filter, X, ChevronDown, ChevronUp, Sparkles, DollarSign, Tag as TagIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { getSkills } from "@/src/shared/api/catalog";

interface OrderFiltersProps {
  search: string;
  statusFilter: string;
  skillsFilter?: string[];
  budgetMin?: number;
  budgetMax?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onSkillsFilterChange?: (skills: string[]) => void;
  onBudgetMinChange?: (value: number | null) => void;
  onBudgetMaxChange?: (value: number | null) => void;
  onSortByChange?: (sortBy: string) => void;
  onSortOrderChange?: (sortOrder: "asc" | "desc") => void;
  onReset: () => void;
  userRole?: "client" | "freelancer" | null;
  onSmartSearch?: () => void;
}

export function OrderFilters({
  search,
  statusFilter,
  skillsFilter = [],
  budgetMin,
  budgetMax,
  sortBy = "date",
  sortOrder = "desc",
  onSearchChange,
  onStatusFilterChange,
  onSkillsFilterChange,
  onBudgetMinChange,
  onBudgetMaxChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
  userRole,
  onSmartSearch,
}: OrderFiltersProps) {
  const theme = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await getSkills();
        setSkillOptions(data.skills?.map(s => s.name) || []);
      } catch (error) {
        console.error("Failed to load skills:", error);
      }
    };
    loadSkills();
  }, []);

  const hasActiveFilters =
    search.length > 0 ||
    statusFilter !== "all" ||
    (skillsFilter && skillsFilter.length > 0) ||
    budgetMin !== undefined ||
    budgetMax !== undefined ||
    sortBy !== "date" ||
    sortOrder !== "desc";

  const activeFiltersCount = [
    search.length > 0,
    statusFilter !== "all",
    skillsFilter && skillsFilter.length > 0,
    budgetMin !== undefined,
    budgetMax !== undefined,
  ].filter(Boolean).length;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: 2, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            Фильтры поиска
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} активных`}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: '0.6875rem' }}
            />
          )}
        </Box>
      </Box>

      <Stack spacing={2}>
        {/* Search */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
            Поиск
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={userRole === "freelancer" ? "Поиск заказов..." : "По названию или описанию..."}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
          />
          {userRole === "freelancer" && onSmartSearch && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<Sparkles size={16} />}
              onClick={onSmartSearch}
              sx={{ mt: 1 }}
            >
              Умный поиск AI
            </Button>
          )}
        </Box>

        <Divider />

        {/* Status */}
        <FormControl fullWidth size="small">
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
            <Filter size={12} />
            Статус заказа
          </Typography>
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <MenuItem value="all">Все статусы</MenuItem>
            <MenuItem value="published">Опубликован</MenuItem>
            <MenuItem value="in_progress">В работе</MenuItem>
            <MenuItem value="completed">Завершен</MenuItem>
            <MenuItem value="cancelled">Отменен</MenuItem>
          </Select>
        </FormControl>

        {/* Sort */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
            <ArrowUpDown size={12} />
            Сортировка
          </Typography>
          <Stack spacing={1}>
            <FormControl fullWidth size="small">
              <Select
                value={sortBy}
                onChange={(e) => onSortByChange?.(e.target.value)}
              >
                <MenuItem value="date">По дате создания</MenuItem>
                <MenuItem value="budget">По бюджету</MenuItem>
                <MenuItem value="proposals">По количеству откликов</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Select
                value={sortOrder}
                onChange={(e) => onSortOrderChange?.(e.target.value as "asc" | "desc")}
              >
                <MenuItem value="desc">По убыванию</MenuItem>
                <MenuItem value="asc">По возрастанию</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Divider />

        {/* Advanced Filters Toggle */}
        <Button
          fullWidth
          variant="text"
          onClick={() => setShowAdvanced(!showAdvanced)}
          endIcon={showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          sx={{ justifyContent: 'space-between' }}
        >
          <Typography variant="caption" textTransform="uppercase" fontWeight={600} letterSpacing={0.5}>
            Расширенные фильтры
          </Typography>
          {activeFiltersCount > 0 && !showAdvanced && (
            <Chip
              label={activeFiltersCount}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: '0.6875rem' }}
            />
          )}
        </Button>

        {/* Advanced Filters Content */}
        <Collapse in={showAdvanced}>
          <Stack spacing={2}>
            {/* Skills */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                <TagIcon size={12} />
                Требуемые навыки
              </Typography>
              <Autocomplete
                multiple
                size="small"
                freeSolo
                options={skillOptions}
                value={skillsFilter}
                onChange={(_, newValue) => onSkillsFilterChange?.(newValue)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Выберите навыки..." />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option} label={option} size="small" />
                  ))
                }
              />
            </Box>

            {/* Budget */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                <DollarSign size={12} />
                Бюджет (₽)
              </Typography>
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="От"
                  value={budgetMin || ''}
                  onChange={(e) => onBudgetMinChange?.(e.target.value ? Number(e.target.value) : null)}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="До"
                  value={budgetMax || ''}
                  onChange={(e) => onBudgetMaxChange?.(e.target.value ? Number(e.target.value) : null)}
                  inputProps={{ min: budgetMin || 0 }}
                />
              </Stack>
            </Box>
          </Stack>
        </Collapse>

        <Divider />

        {/* Reset Button */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<X size={16} />}
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          Сбросить все фильтры
        </Button>

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
              Активные фильтры
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {search && (
                <Chip
                  label={`Поиск: "${search.length > 20 ? search.substring(0, 20) + "..." : search}"`}
                  size="small"
                  onDelete={() => onSearchChange("")}
                  color="primary"
                />
              )}
              {statusFilter !== "all" && (
                <Chip
                  label={getStatusLabel(statusFilter)}
                  size="small"
                  onDelete={() => onStatusFilterChange("all")}
                  color="primary"
                />
              )}
              {skillsFilter && skillsFilter.length > 0 && (
                <Chip
                  label={`Навыки (${skillsFilter.length})`}
                  size="small"
                  onDelete={() => onSkillsFilterChange?.([])}
                  color="primary"
                />
              )}
              {budgetMin !== undefined && (
                <Chip
                  label={`От ${budgetMin.toLocaleString("ru-RU")} ₽`}
                  size="small"
                  onDelete={() => onBudgetMinChange?.(null)}
                  color="primary"
                />
              )}
              {budgetMax !== undefined && (
                <Chip
                  label={`До ${budgetMax.toLocaleString("ru-RU")} ₽`}
                  size="small"
                  onDelete={() => onBudgetMaxChange?.(null)}
                  color="primary"
                />
              )}
              {sortBy !== "date" && (
                <Chip
                  label={`${getSortLabel(sortBy)} (${sortOrder === "asc" ? "↑" : "↓"})`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    published: "Опубликован",
    in_progress: "В работе",
    completed: "Завершен",
    cancelled: "Отменен",
  };
  return labels[status] || status;
}

function getSortLabel(sortBy: string): string {
  const labels: Record<string, string> = {
    date: "По дате",
    budget: "По бюджету",
    proposals: "По откликам",
  };
  return labels[sortBy] || sortBy;
}
