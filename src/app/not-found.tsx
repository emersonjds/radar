import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted p-6 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold text-foreground">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        O endereço que você tentou abrir não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Voltar ao painel
      </Link>
    </main>
  );
}
