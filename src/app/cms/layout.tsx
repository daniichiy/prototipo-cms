import Sidebar from "@/components/cms/Sidebar";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs text-slate-400">Painel administrativo</p>
            <h1 className="text-lg font-semibold text-navy-900">
              Cadastro de Unidades — MS
            </h1>
          </div>
        </header>
        <main className="flex-1 bg-slate-50 p-6">{children}</main>
      </div>
    </div>
  );
}
