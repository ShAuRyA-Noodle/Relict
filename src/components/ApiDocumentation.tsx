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
    description: "Upload and analyze eDNA sample",
    parameters: [
      { name: "file", type: "File", required: true, description: "FASTA or CSV file (max 20MB)" },
      { name: "format", type: "string", required: false, description: "Output format preference" }
    ],
    example: `curl -X POST https://api.relict.dev/analyze \\
  -F "file=@sample.fasta" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  },
  {
    method: "GET", 
    path: "/api/job/:id",
    description: "Get analysis job status and results",
    parameters: [
      { name: "id", type: "string", required: true, description: "Job ID returned from analyze endpoint" }
    ],
    example: `curl -X GET https://api.relict.dev/job/abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  },
  {
    method: "GET",
    path: "/api/species",
    description: "Search species database",
    parameters: [
      { name: "q", type: "string", required: false, description: "Search query" },
      { name: "limit", type: "number", required: false, description: "Results limit (default: 50)" }
    ],
    example: `curl -X GET "https://api.relict.dev/species?q=thunnus&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  }
];

const responseExamples = {
  analyze: `{
  "job_id": "abc123-def456-789",
  "status": "processing",
  "estimated_completion": "2024-01-15T10:30:00Z",
  "message": "Analysis started successfully"
}`,
  job: `{
  "job_id": "abc123-def456-789", 
  "status": "complete",
  "created_at": "2024-01-15T10:25:00Z",
  "completed_at": "2024-01-15T10:28:14Z",
  "summary": {
    "biodiversity_index": 0.82,
    "species_total": 28,
    "processing_ms": 4120,
    "confidence_avg": 0.89
  },
  "species": [
    {
      "name": "Thunnus albacares",
      "common_name": "Yellowfin tuna", 
      "rank": "species",
      "taxonomy_id": 8236,
      "count": 50,
      "confidence": 0.93
    },
    {
      "name": "Carcharhinus limbatus",
      "common_name": "Blacktip shark",
      "rank": "species", 
      "taxonomy_id": 7801,
      "count": 42,
      "confidence": 0.88
    }
  ]
}`,
  species: `{
  "results": [
    {
      "name": "Thunnus albacares",
      "common_name": "Yellowfin tuna",
      "taxonomy_id": 8236,
      "rank": "species",
      "family": "Scombridae",
      "order": "Perciformes"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}`
};

export const ApiDocumentation = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully"
    });
  };

  return (
    <div className="space-y-8">
      {/* API Overview */}
      <Card className="p-8 glass">
        <h2 className="text-2xl font-display font-bold mb-4">API Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-emerald/10 rounded-lg">
            <Code className="w-8 h-8 mx-auto mb-2 text-emerald" />
            <div className="font-semibold">RESTful API</div>
            <div className="text-sm text-muted-foreground">JSON responses</div>
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-lg">
            <Play className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="font-semibold">Real-time Analysis</div>
            <div className="text-sm text-muted-foreground">Async processing</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Badge className="mb-2">OAuth 2.0</Badge>
            <div className="font-semibold">Secure Access</div>
            <div className="text-sm text-muted-foreground">API key required</div>
          </div>
        </div>
      </Card>

      {/* Base URL and Authentication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-display font-semibold mb-4">Base URL</h3>
          <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm">
            https://api.relict.dev/v1
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-display font-semibold mb-4">Authentication</h3>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm font-mono">Authorization: Bearer YOUR_API_KEY</div>
          </div>
        </Card>
      </div>

      {/* Endpoints */}
      <Card className="p-8 glass">
        <h2 className="text-2xl font-display font-bold mb-6">API Endpoints</h2>
        
        <div className="space-y-8">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="border-l-4 border-emerald/20 pl-6">
              <div className="flex items-center space-x-3 mb-4">
                <Badge 
                  variant={endpoint.method === 'POST' ? 'default' : 'secondary'}
                  className="text-xs font-mono"
                >
                  {endpoint.method}
                </Badge>
                <code className="font-mono text-lg font-semibold">{endpoint.path}</code>
              </div>
              
              <p className="text-muted-foreground mb-4">{endpoint.description}</p>
              
              {endpoint.parameters.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <div className="space-y-2">
                    {endpoint.parameters.map((param, paramIndex) => (
                      <div key={paramIndex} className="flex items-start space-x-3 text-sm">
                        <code className="font-mono bg-muted/50 px-2 py-1 rounded">
                          {param.name}
                        </code>
                        <span className="text-muted-foreground">{param.type}</span>
                        {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        <span className="text-muted-foreground flex-1">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-ink/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Example Request</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                  >
                    {copiedCode === `endpoint-${index}` ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-sm font-mono overflow-x-auto">{endpoint.example}</pre>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Response Examples */}
      <Card className="p-8 glass">
        <h2 className="text-2xl font-display font-bold mb-6">Response Examples</h2>
        
        <Tabs defaultValue="analyze" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">POST /analyze</TabsTrigger>
            <TabsTrigger value="job">GET /job/:id</TabsTrigger>
            <TabsTrigger value="species">GET /species</TabsTrigger>
          </TabsList>

          {Object.entries(responseExamples).map(([key, response]) => (
            <TabsContent key={key} value={key}>
              <div className="bg-ink/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">JSON Response</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(response, `response-${key}`)}
                  >
                    {copiedCode === `response-${key}` ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {response}
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Rate Limits and Status Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-display font-semibold mb-4">Rate Limits</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Requests per minute:</span>
              <Badge variant="secondary">100</Badge>
            </div>
            <div className="flex justify-between">
              <span>Upload size limit:</span>
              <Badge variant="secondary">20MB</Badge>
            </div>
            <div className="flex justify-between">
              <span>Concurrent analyses:</span>
              <Badge variant="secondary">5</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-display font-semibold mb-4">Status Codes</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/10 text-green-600">200</Badge>
              <span>Success</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-500/10 text-blue-600">202</Badge>
              <span>Accepted (Processing)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-500/10 text-yellow-600">400</Badge>
              <span>Bad Request</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-500/10 text-red-600">401</Badge>
              <span>Unauthorized</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-500/10 text-red-600">429</Badge>
              <span>Rate Limit Exceeded</span>
            </div>
          </div>
        </Card>
      </div>

      {/* SDK and Support */}
      <Card className="p-8 bg-gradient-hero text-white text-center">
        <h2 className="text-2xl font-display font-bold mb-4">
          SDK and Support
        </h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Python SDK coming soon. Need help integrating our API? 
          Contact our developer support team.
        </p>
        <div className="text-sm opacity-75">
          <p><strong>Issues / Contributions:</strong> open a GitHub issue on the repository</p>
          <p>Self-hosted — API base URL is your own deployment</p>
        </div>
      </Card>
    </div>
  );
};