"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { GuideContent, PageResponse } from "@/types/index";
import Link from "next/link";

export default function ContentsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data, isLoading, error } = useQuery({
    queryKey: ["contents", page, search, sort],
    queryFn: () =>
      api.get<PageResponse<GuideContent>>(
        `/dashboard/contents?page=${page}&pageSize=20&sort=${sort}${search ? `&search=${encodeURIComponent(search)}` : ""}`
      )
  });

  const items = data?.items ?? [];

  const submitSearch = () => {
    setPage(0);
    setSearch(searchInput);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-[#374151]">Conteúdos</h1>
        <div className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitSearch();
              }
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Buscar por título ou loja"
          />
          <button
            onClick={submitSearch}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
          >
            Buscar
          </button>
          <select
            value={sort}
            onChange={(e) => {
              setPage(0);
              setSort(e.target.value as "newest" | "oldest");
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-[#6B7280] border-b border-gray-200">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Título</th>
              <th className="py-3 px-4">Brechó</th>
              <th className="py-3 px-4">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-3 px-4" colSpan={3}>
                  Carregando...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="py-3 px-4 text-red-600" colSpan={3}>
                  Erro ao carregar conteúdos
                </td>
              </tr>
            )}
            {!isLoading && !error && items.length === 0 && (
              <tr>
                <td className="py-3 px-4 text-[#6B7280]" colSpan={3}>
                  Nenhum conteúdo encontrado.
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-xs text-[#6B7280]">{c.id}</td>
                <td className="py-3 px-4 font-semibold text-[#374151]">
                  <Link href={`/contents/${c.id}`} className="text-[#B55D05] hover:underline">
                    {c.title}
                  </Link>
                </td>
                <td className="py-3 px-4 text-[#6B7280]">{c.thriftStoreName ?? c.thriftStoreId}</td>
                <td className="py-3 px-4 text-[#6B7280]">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-[#374151]">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
        >
          Anterior
        </button>
        <div>
          Página {page + 1} {data?.hasNext ? "" : "(última)"}
        </div>
        <button
          disabled={!data?.hasNext}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
