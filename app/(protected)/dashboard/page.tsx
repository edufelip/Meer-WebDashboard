import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-[#374151]">Resumo</h1>
        <p className="text-[#6B7280]">
          Escolha uma seção para gerenciar brechós, conteúdos, usuários ou moderação.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <Card title="Brechós" description="Listar e moderar brechós" href="/stores" />
        <Card title="Conteúdos" description="Publicações dos brechós" href="/contents" />
        <Card title="Usuários" description="Gerenciar contas e privilégios" href="/users" />
        <Card title="Moderação" description="Fila de denúncias e revisões" href="/moderation" />
        <Card title="Categorias" description="Gerenciar categorias" href="/categories" />
      </div>
    </div>
  );
}

function Card({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:shadow transition-shadow"
    >
      <div className="text-lg font-semibold text-[#374151]">{title}</div>
      <div className="text-sm text-[#6B7280] mt-1">{description}</div>
    </Link>
  );
}
