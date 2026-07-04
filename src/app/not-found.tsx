import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 p-6 text-center">
      <p className="text-5xl font-bold text-brand-500">404</p>
      <h1 className="text-xl font-semibold text-gray-800">Página não encontrada</h1>
      <p className="text-sm text-gray-500">
        O endereço que você tentou abrir não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white hover:bg-brand-600"
      >
        Voltar ao painel
      </Link>
    </main>
  );
}
