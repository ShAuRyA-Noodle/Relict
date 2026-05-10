import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const endpoints = [
  {
    method: "POST",
    path: "/api/analyze",
    description: "Upload and analyze an eDNA sample.",
    parameters: [
      { name: "file", type: "File", required: true, description: "FASTA or CSV file (max 20 MB)" },
      { name: "format", type: "string", required: false, description: "Output format preference" },
    ],
    example: `curl -X POST https://api.relict.dev/analyze \\
  -F "file=@sample.fasta" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    method: "GET",
    path: "/api/job/:id",
    description: "Get analysis job status and results.",
    parameters: [{ name: "id", type: "string", required: true, description: "Job ID returned from /analyze" }],
    example: `curl -X GET https://api.relict.dev/job/abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    method: "GET",
    path: "/api/species",
    description: "Search the species database.",
    parameters: [
      { name: "q",     type: "string", required: false, description: "Search query" },
      { name: "limit", type: "number", required: false, description: "Results limit (default 50)" },
    ],
    example: `curl -X GET "https://api.relict.dev/species?q=thunnus&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
];

const responseExamples: Record<string, string> = {
  analyze: `{
  "job_id": "abc123-def456-789",
  "status": "processing",
  "estimated_completion": "2024-01-15T10:30:00Z"
}`,
  job: `{
  "job_id": "abc123-def456-789",
  "status": "complete",
  "summary": {
    "biodiversity_index": 0.82,
    "species_total": 28
  }
}`,
  species: `{
  "results": [
    {
      "name": "Thunnus albacares",
      "common_name": "Yellowfin tuna",
      "taxonomy_id": 8236,
      "rank": "species"
    }
  ],
  "total": 1
}`,
};

export const ApiDocumentation = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
    toast({ title: "Copied", description: "Code example copied to clipboard." });
  };

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <h2 className="font-display text-2xl mb-5">API overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Feature icon={<Code  className="w-5 h-5 text-primary" />} title="RESTful API"        sub="JSON responses" />
          <Feature icon={<Play  className="w-5 h-5 text-primary" />} title="Real-time analysis" sub="Async processing" />
          <Feature icon={<Badge className="text-xs">OAuth 2.0</Badge>} title="Secure access"     sub="API key required" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="font-display text-lg mb-3">Base URL</h3>
          <div className="bg-muted px-3 py-2 rounded-md font-mono text-sm">https://api.relict.dev/v1</div>
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-lg mb-3">Authentication</h3>
          <div className="bg-muted px-3 py-2 rounded-md font-mono text-sm">Authorization: Bearer YOUR_API_KEY</div>
        </Card>
      </div>

      <Card className="p-8">
        <h2 className="font-display text-2xl mb-6">Endpoints</h2>
        <div className="space-y-8">
          {endpoints.map((ep, i) => (
            <div key={i} className="border-l-2 border-primary/30 pl-5">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={ep.method === "POST" ? "default" : "secondary"} className="text-[10px] font-mono">
                  {ep.method}
                </Badge>
                <code className="font-mono text-base font-semibold">{ep.path}</code>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{ep.description}</p>

              {ep.parameters.length > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-sm mb-2">Parameters</p>
                  <div className="space-y-2">
                    {ep.parameters.map((p, j) => (
                      <div key={j} className="flex items-start gap-3 text-sm">
                        <code className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{p.name}</code>
                        <span className="text-muted-foreground">{p.type}</span>
                        {p.required && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                        <span className="text-muted-foreground flex-1">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/60 rounded-md p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Example</span>
                  <Button variant="outline" size="sm" onClick={() => copy(ep.example, `ep-${i}`)}>
                    {copied === `ep-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="text-xs font-mono overflow-x-auto">{ep.example}</pre>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8">
        <h2 className="font-display text-2xl mb-6">Response examples</h2>
        <Tabs defaultValue="analyze" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">POST /analyze</TabsTrigger>
            <TabsTrigger value="job">GET /job/:id</TabsTrigger>
            <TabsTrigger value="species">GET /species</TabsTrigger>
          </TabsList>
          {Object.entries(responseExamples).map(([key, body]) => (
            <TabsContent key={key} value={key}>
              <div className="bg-muted/60 rounded-md p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">JSON response</span>
                  <Button variant="outline" size="sm" onClick={() => copy(body, `r-${key}`)}>
                    {copied === `r-${key}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">{body}</pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

const Feature = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) => (
  <div className="text-center p-4 rounded-md bg-muted/50 border border-border">
    <div className="mb-2 flex items-center justify-center">{icon}</div>
    <p className="font-medium text-sm">{title}</p>
    <p className="text-xs text-muted-foreground">{sub}</p>
  </div>
);
