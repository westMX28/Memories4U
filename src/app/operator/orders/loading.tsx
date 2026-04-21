import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoadingOperatorOrdersPage() {
  return (
    <main className="section page-shell">
      <div className="container space-y-6">
        <Card className="border-slate-900/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.96),rgba(21,34,53,0.92))] text-white">
          <CardHeader className="space-y-3 p-6 lg:p-8">
            <div className="h-5 w-40 rounded-full bg-white/10" />
            <div className="h-12 w-full max-w-xl rounded-[20px] bg-white/10" />
            <div className="h-5 w-full max-w-2xl rounded-full bg-white/8" />
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="border-slate-200/70 bg-white/88">
              <CardHeader className="space-y-3">
                <div className="h-4 w-24 rounded-full bg-slate-100" />
                <div className="h-8 w-40 rounded-[16px] bg-slate-100" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 w-full rounded-full bg-slate-100" />
                <div className="h-4 w-5/6 rounded-full bg-slate-100" />
                <div className="h-4 w-2/3 rounded-full bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
