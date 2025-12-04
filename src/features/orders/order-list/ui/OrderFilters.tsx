"use client";

import { useState } from "react";
import { Input, Select, Button, Typography, InputNumber, Space, Tag, Divider, theme } from "antd";
import { Search, Filter, X, ChevronDown, ChevronUp, Sparkles, RussianRuble, Tag as TagIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { formatNumber, parseFormattedNumber, COMMON_SKILLS } from "@/src/shared/lib/utils";

const { Text } = Typography;
const { useToken } = theme;

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
  const { token } = useToken();
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    <div style={{ width: "100%" }}>
      {/* Заголовок секции фильтров */}
      <div
        style={{
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Text
          strong
          style={{
            fontSize: 14,
            lineHeight: "22px",
            fontWeight: 600,
            color: token.colorTextHeading,
            letterSpacing: "-0.01em",
          }}
        >
          Фильтры поиска
        </Text>
        {activeFiltersCount > 0 && (
          <Tag
            color="blue"
            style={{
              marginLeft: 8,
              fontSize: 11,
              lineHeight: "18px",
              padding: "2px 8px",
              borderRadius: token.borderRadiusSM,
              fontWeight: 500,
            }}
          >
            {activeFiltersCount} активных
          </Tag>
        )}
      </div>

      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        {/* Поиск */}
        <div>
            <Text
              strong
              style={{
                fontSize: 11,
                lineHeight: "18px",
                display: "block",
                marginBottom: 8,
                color: token.colorTextSecondary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Поиск
            </Text>
          <Input
            size="middle"
            placeholder={userRole === "freelancer" ? "Поиск заказов..." : "По названию или описанию..."}
            prefix={<Search size={14} style={{ color: token.colorTextTertiary }} />}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            style={{
              width: "100%",
              borderRadius: token.borderRadius,
              fontSize: 13,
            }}
          />
          {userRole === "freelancer" && (
            <Button
              type="primary"
              icon={<Sparkles size={14} />}
              onClick={onSmartSearch}
              block
              style={{
                width: "100%",
                marginTop: 8,
                height: 36,
                borderRadius: token.borderRadius,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              Умный поиск AI
            </Button>
          )}
        </div>

        <Divider
          style={{
            margin: 0,
            borderColor: token.colorBorderSecondary,
          }}
        />

        {/* Статус */}
        <div>
            <div
              style={{
                fontSize: 11,
                lineHeight: "18px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                color: token.colorTextSecondary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <Filter size={12} style={{ color: token.colorTextTertiary, flexShrink: 0 }} />
              <Text
                strong
                style={{
                  fontSize: 11,
                  lineHeight: "18px",
                  color: token.colorTextSecondary,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: 0,
                }}
              >
                Статус заказа
              </Text>
            </div>
          <Select
            size="middle"
            placeholder="Выберите статус"
            value={statusFilter}
            onChange={onStatusFilterChange}
            style={{ width: "100%", fontSize: 13 }}
            popupMatchSelectWidth={false}
            options={[
              { label: "Все статусы", value: "all" },
              { label: "Опубликован", value: "published" },
              { label: "В работе", value: "in_progress" },
              { label: "Завершен", value: "completed" },
              { label: "Отменен", value: "cancelled" },
            ]}
          />
        </div>

        {/* Сортировка */}
        <div>
            <div
              style={{
                fontSize: 11,
                lineHeight: "18px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                color: token.colorTextSecondary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <ArrowUpDown size={12} style={{ color: token.colorTextTertiary, flexShrink: 0 }} />
              <Text
                strong
                style={{
                  fontSize: 11,
                  lineHeight: "18px",
                  color: token.colorTextSecondary,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: 0,
                }}
              >
                Сортировка
              </Text>
            </div>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Select
              size="middle"
              placeholder="Сортировать по"
              value={sortBy}
              onChange={onSortByChange}
              style={{ width: "100%", fontSize: 13 }}
              popupMatchSelectWidth={false}
              options={[
                { label: "По дате создания", value: "date" },
                { label: "По бюджету", value: "budget" },
                { label: "По количеству откликов", value: "proposals" },
              ]}
            />
            <Select
              size="middle"
              value={sortOrder}
              onChange={onSortOrderChange}
              suffixIcon={sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              style={{ width: "100%", fontSize: 13 }}
              popupMatchSelectWidth={false}
              options={[
                { label: "По убыванию", value: "desc" },
                { label: "По возрастанию", value: "asc" },
              ]}
            />
          </Space>
        </div>

        <Divider
          style={{
            margin: 0,
            borderColor: token.colorBorderSecondary,
          }}
        />

        {/* Расширенные фильтры */}
        <div>
          <Button
            type="text"
            icon={showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            block
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              height: "auto",
              fontWeight: 600,
              color: token.colorTextHeading,
              fontSize: 13,
            }}
          >
            <Text
              strong
              style={{
                fontSize: 11,
                lineHeight: "18px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: token.colorTextSecondary,
              }}
            >
              Расширенные фильтры
            </Text>
            {activeFiltersCount > 0 && !showAdvanced && (
              <Tag
                color="blue"
                style={{
                  margin: 0,
                  fontSize: 11,
                  lineHeight: "18px",
                  padding: "2px 8px",
                  borderRadius: token.borderRadiusSM,
                  fontWeight: 500,
                }}
              >
                {activeFiltersCount}
              </Tag>
            )}
          </Button>

          {showAdvanced && (
            <Space direction="vertical" size={18} style={{ width: "100%", marginTop: 12 }}>
              {/* Навыки */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    lineHeight: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                    color: token.colorTextSecondary,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <TagIcon size={12} style={{ color: token.colorTextTertiary, flexShrink: 0 }} />
                  <Text
                    strong
                    style={{
                      fontSize: 11,
                      lineHeight: "18px",
                      color: token.colorTextSecondary,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      margin: 0,
                    }}
                  >
                    Требуемые навыки
                  </Text>
                </div>
                <Select
                  mode="multiple"
                  size="middle"
                  placeholder="Выберите навыки..."
                  value={skillsFilter}
                  onChange={onSkillsFilterChange}
                  options={COMMON_SKILLS.map(skill => ({ label: skill, value: skill }))}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  maxTagCount="responsive"
                  style={{ width: "100%", fontSize: 13 }}
                  popupMatchSelectWidth={false}
                />
              </div>

              {/* Бюджет */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    lineHeight: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                    color: token.colorTextSecondary,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <RussianRuble size={12} style={{ color: token.colorTextTertiary, flexShrink: 0 }} />
                  <Text
                    strong
                    style={{
                      fontSize: 11,
                      lineHeight: "18px",
                      color: token.colorTextSecondary,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      margin: 0,
                    }}
                  >
                    Бюджет (₽)
                  </Text>
                </div>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Space.Compact style={{ width: "100%" }}>
                    <span style={{ fontSize: 13, display: "flex", alignItems: "center", padding: "0 8px", background: token.colorFillAlter, border: `1px solid ${token.colorBorder}`, borderRight: "none", borderRadius: `${token.borderRadius}px 0 0 ${token.borderRadius}px` }}>От</span>
                    <InputNumber
                      size="middle"
                      placeholder="Минимальная сумма"
                      value={budgetMin}
                      onChange={onBudgetMinChange}
                      min={0}
                      style={{ flex: 1, fontSize: 13, borderRadius: `0 ${token.borderRadius}px ${token.borderRadius}px 0` }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                      parser={((value: string | undefined): number => {
                        const cleaned = value?.replace(/\s?/g, "") || "";
                        return cleaned ? Number(cleaned) : 0;
                      })}
                    />
                  </Space.Compact>
                  <Space.Compact style={{ width: "100%" }}>
                    <span style={{ fontSize: 13, display: "flex", alignItems: "center", padding: "0 8px", background: token.colorFillAlter, border: `1px solid ${token.colorBorder}`, borderRight: "none", borderRadius: `${token.borderRadius}px 0 0 ${token.borderRadius}px` }}>До</span>
                    <InputNumber
                      size="middle"
                      placeholder="Максимальная сумма"
                      value={budgetMax}
                      onChange={onBudgetMaxChange}
                      min={budgetMin || 0}
                      style={{ flex: 1, fontSize: 13, borderRadius: `0 ${token.borderRadius}px ${token.borderRadius}px 0` }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                      parser={((value: string | undefined): number => {
                        const cleaned = value?.replace(/\s?/g, "") || "";
                        return cleaned ? Number(cleaned) : 0;
                      })}
                    />
                  </Space.Compact>
                </Space>
              </div>
            </Space>
          )}
        </div>

        <Divider
          style={{
            margin: 0,
            borderColor: token.colorBorderSecondary,
          }}
        />

        {/* Кнопка сброса */}
        <Button
          size="middle"
          icon={<X size={14} />}
          onClick={onReset}
          disabled={!hasActiveFilters}
          block
          danger={hasActiveFilters}
          style={{
            width: "100%",
            height: 36,
            borderRadius: token.borderRadius,
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          Сбросить все фильтры
        </Button>

        {/* Активные фильтры (теги) */}
        {hasActiveFilters && (
          <div
            style={{
              paddingTop: 14,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Text
              strong
              style={{
                fontSize: 11,
                lineHeight: "18px",
                display: "block",
                marginBottom: 10,
                color: token.colorTextSecondary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Активные фильтры
            </Text>
            <Space wrap size={[8, 8]} style={{ width: "100%" }}>
              {search && (
                <Tag
                  closable
                  onClose={() => onSearchChange("")}
                  color="blue"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "18px",
                    padding: "3px 8px",
                    borderRadius: token.borderRadiusSM,
                    fontWeight: 500,
                  }}
                >
                  Поиск: "{search.length > 20 ? search.substring(0, 20) + "..." : search}"
                </Tag>
              )}
              {statusFilter !== "all" && (
                <Tag
                  closable
                  onClose={() => onStatusFilterChange("all")}
                  color="blue"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "18px",
                    padding: "3px 8px",
                    borderRadius: token.borderRadiusSM,
                    fontWeight: 500,
                  }}
                >
                  {getStatusLabel(statusFilter)}
                </Tag>
              )}
              {skillsFilter && skillsFilter.length > 0 && (
                <Tag
                  closable
                  onClose={() => onSkillsFilterChange?.([])}
                  color="blue"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "18px",
                    padding: "3px 8px",
                    borderRadius: token.borderRadiusSM,
                    fontWeight: 500,
                  }}
                >
                  Навыки ({skillsFilter.length})
                </Tag>
              )}
              {budgetMin !== undefined && (
                <Tag
                  closable
                  onClose={() => onBudgetMinChange?.(null)}
                  color="blue"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "18px",
                    padding: "3px 8px",
                    borderRadius: token.borderRadiusSM,
                    fontWeight: 500,
                  }}
                >
                  От {budgetMin.toLocaleString("ru-RU")} ₽
                </Tag>
              )}
              {budgetMax !== undefined && (
                <Tag
                  closable
                  onClose={() => onBudgetMaxChange?.(null)}
                  color="blue"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "18px",
                    padding: "3px 8px",
                    borderRadius: token.borderRadiusSM,
                    fontWeight: 500,
                  }}
                >
                  До {budgetMax.toLocaleString("ru-RU")} ₽
                </Tag>
              )}
              {sortBy !== "date" && (
                <Tag
                  color="default"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: "18px",
                    padding: "3px 8px",
                    borderRadius: token.borderRadiusSM,
                    fontWeight: 500,
                  }}
                >
                  {getSortLabel(sortBy)} ({sortOrder === "asc" ? "↑" : "↓"})
                </Tag>
              )}
            </Space>
          </div>
        )}
      </Space>
    </div>
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
