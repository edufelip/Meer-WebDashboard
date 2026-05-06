"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessages";
import {
  getStoreBadgeLabel,
  isKnownStoreBadge,
  normalizeStoreBadges,
  STORE_BADGES,
  type StoreBadgeCode
} from "@/lib/storeBadges";
import { formatStoreAddress } from "@/lib/storeAddress";
import type { ThriftStore, PageResponse } from "@/types/index";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";

type StoreBadgeFilter = "ALL" | StoreBadgeCode;
type StoreListMode = "ALL" | "ONLINE_ONLY";
type StoreSort = "newest" | "oldest" | "name_asc" | "name_desc";
const PAGE_SIZE = 20;
const ALL_CITIES = "ALL";

type StoreCitiesResponse = {
  items: string[];
};

export default function StoresPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<StoreSort>("newest");
  const [badgeFilter, setBadgeFilter] = useState<StoreBadgeFilter>("ALL");
  const [cityFilter, setCityFilter] = useState<string>(ALL_CITIES);
  const [storeListMode, setStoreListMode] = useState<StoreListMode>("ALL");
  const isOnlineOnly = storeListMode === "ONLINE_ONLY";

  const { data: citiesData, error: citiesError } = useQuery({
    queryKey: ["store-cities"],
    queryFn: () => api.get<StoreCitiesResponse>("/dashboard/stores/cities"),
    enabled: !isOnlineOnly
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["stores", storeListMode, page, search, sort, badgeFilter, cityFilter],
    queryFn: () =>
      isOnlineOnly
        ? api.get<PageResponse<ThriftStore>>(buildStoreListPath("/dashboard/stores/online", { page, sort, search, badgeFilter }))
        : api.get<PageResponse<ThriftStore>>(
            buildStoreListPath("/dashboard/stores", { page, sort, search, badgeFilter, cityFilter })
          )
  });

  const items = data?.items ?? [];
  const cityOptions = Array.isArray(citiesData?.items) ? citiesData.items : [];
  const cityFilterDisabled = isOnlineOnly || (cityOptions.length === 0 && Boolean(citiesError));

  const submitSearch = () => {
    setPage(0);
    setSearch(searchInput);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <PageHeader
        title="Brechós"
        subtitle="Listar e moderar brechós cadastrados na plataforma."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/stores/new"
              className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-textDark shadow-sm transition-colors hover:bg-white"
            >
              Novo brechó
            </Link>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitSearch();
                }
              }}
              name="store-search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Buscar brechós"
              className="w-full sm:w-64 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-textDark shadow-sm placeholder:text-textSubtle/70 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
              placeholder={isOnlineOnly ? "Buscar por nome ou descrição…" : "Buscar por nome, endereço ou dono…"}
            />
            <select
              value={storeListMode}
              onChange={(e) => {
                const nextMode = e.target.value as StoreListMode;
                setPage(0);
                if (nextMode === "ONLINE_ONLY") {
                  setCityFilter(ALL_CITIES);
                }
                setStoreListMode(nextMode);
              }}
              name="store-mode"
              aria-label="Filtrar tipo de brechó"
              className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-textDark shadow-sm focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <option className="text-black" value="ALL">
                Todos os brechós
              </option>
              <option className="text-black" value="ONLINE_ONLY">
                Apenas online
              </option>
            </select>
            <select
              value={cityFilter}
              onChange={(e) => {
                setPage(0);
                setCityFilter(e.target.value);
              }}
              name="store-city-filter"
              aria-label="Filtrar por cidade"
              disabled={cityFilterDisabled}
              className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-textDark shadow-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <option className="text-black" value={ALL_CITIES}>
                Todas as cidades
              </option>
              {!cityFilterDisabled
                ? cityOptions.map((city) => (
                    <option key={city} className="text-black" value={city}>
                      {city}
                    </option>
                  ))
                : null}
            </select>
            <select
              value={badgeFilter}
              onChange={(e) => {
                setPage(0);
                setBadgeFilter(e.target.value as StoreBadgeFilter);
              }}
              name="store-badge-filter"
              aria-label="Filtrar por badge"
              className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-textDark shadow-sm focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <option className="text-black" value="ALL">
                Todas as badges
              </option>
              <option className="text-black" value={STORE_BADGES.AMBASSADOR}>
                {getStoreBadgeLabel(STORE_BADGES.AMBASSADOR)}
              </option>
            </select>
            <select
              value={sort}
              onChange={(e) => {
                setPage(0);
                setSort(e.target.value as StoreSort);
              }}
              name="store-sort"
              aria-label="Ordenar brechós"
              className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-textDark shadow-sm focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <option className="text-black" value="newest">
                Mais recentes
              </option>
              <option className="text-black" value="oldest">
                Mais antigos
              </option>
              <option className="text-black" value="name_asc">
                Nome (A-Z)
              </option>
              <option className="text-black" value="name_desc">
                Nome (Z-A)
              </option>
            </select>
            <button
              onClick={submitSearch}
              className="rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-forest shadow-sm transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              Buscar
            </button>
          </div>
        }
      />

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm text-white">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-white/60">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Nome</th>
              <th className="py-3 px-4">Dono</th>
              <th className="py-3 px-4">Endereço</th>
              <th className="py-3 px-4">Badges</th>
              <th className="py-3 px-4">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-3 px-4" colSpan={6}>
                  Carregando…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="py-3 px-4 text-red-300" colSpan={6}>
                  {getErrorMessage(error, "Erro ao carregar brechós")}
                </td>
              </tr>
            )}
            {!isLoading && !error && items.length === 0 && (
              <EmptyStateRow colSpan={6} title="Nenhum brechó encontrado" description="Tente ajustar o termo de busca." />
            )}
            {items.map((s) => {
              const badges = normalizeStoreBadges(s.badges);
              return (
                <tr key={s.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-xs text-white/60">{s.id}</td>
                  <td className="py-3 px-4 font-semibold">
                    <Link href={`/stores/${s.id}`} className="text-brand-primary hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    {s.ownerId && s.ownerName ? (
                      <Link href={`/users/${s.ownerId}`} className="text-brand-primary hover:underline">
                        {s.ownerName}
                      </Link>
                    ) : (
                      <span className="text-white/60">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white/90">{formatStoreAddress(s) ?? (s.isOnlineStore ? "Loja online" : "-")}</td>
                  <td className="py-3 px-4">
                    {badges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {badges.map((badgeCode) => (
                          <StoreBadgeChip key={`${s.id}-${badgeCode}`} badgeCode={badgeCode} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/60">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white/70">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="flex items-center justify-between text-sm text-textDark">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-textDark shadow-sm transition-colors hover:bg-white disabled:opacity-40"
        >
          Anterior
        </button>
        <div className="font-medium text-textSubtle">
          Página {page + 1} {data?.hasNext ? "" : "(última)"}
        </div>
        <button
          disabled={!data?.hasNext}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-textDark shadow-sm transition-colors hover:bg-white disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

function StoreBadgeChip({ badgeCode }: { badgeCode: string }) {
  const known = isKnownStoreBadge(badgeCode);
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide " +
        (known ? "bg-brand-primary/90 text-brand-forest" : "bg-white/10 text-white")
      }
      title={known ? "Badge oficial" : "Badge desconhecida"}
    >
      {getStoreBadgeLabel(badgeCode)}
    </span>
  );
}

function buildStoreListPath(
  basePath: string,
  {
    page,
    sort,
    search,
    badgeFilter,
    cityFilter
  }: {
    page: number;
    sort: StoreSort;
    search: string;
    badgeFilter: StoreBadgeFilter;
    cityFilter?: string;
  }
) {
  const params = [`page=${page}`, `pageSize=${PAGE_SIZE}`, `sort=${encodeURIComponent(sort)}`];

  if (search) {
    params.push(`search=${encodeURIComponent(search)}`);
  }

  if (badgeFilter !== "ALL") {
    params.push(`badge=${encodeURIComponent(badgeFilter)}`);
  }

  if (cityFilter && cityFilter !== ALL_CITIES) {
    params.push(`city=${encodeURIComponent(cityFilter)}`);
  }

  return `${basePath}?${params.join("&")}`;
}
