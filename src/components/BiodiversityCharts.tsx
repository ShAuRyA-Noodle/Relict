import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// TODO: Replace mock data with API results when backend ready
// const [taxonomyData, setTaxonomyData] = useState<any[]>([]);
// const [biodiversityTrends, setBiodiversityTrends] = useState<any[]>([]);
// const [regionData, setRegionData] = useState<any[]>([]);



// Mock data for visualization
const taxonomyData = [
  { name: 'Fish', count: 15, percentage: 53.6 },
  { name: 'Crustaceans', count: 6, percentage: 21.4 },
  { name: 'Mollusks', count: 4, percentage: 14.3 },
  { name: 'Cnidarians', count: 2, percentage: 7.1 },
  { name: 'Others', count: 1, percentage: 3.6 },
];

const biodiversityTrends = [
  { month: 'Jan', shannon: 2.1, simpson: 0.82 },
  { month: 'Feb', shannon: 2.3, simpson: 0.85 },
  { month: 'Mar', shannon: 2.0, simpson: 0.79 },
  { month: 'Apr', shannon: 2.5, simpson: 0.88 },
  { month: 'May', shannon: 2.7, simpson: 0.91 },
  { month: 'Jun', shannon: 2.4, simpson: 0.86 },
];

const regionData = [
  { region: 'Coastal', species: 28, samples: 45 },
  { region: 'Deep Sea', species: 15, samples: 22 },
  { region: 'Reef', species: 42, samples: 38 },
  { region: 'Estuary', species: 35, samples: 51 },
  { region: 'Open Ocean', species: 18, samples: 29 },
];

const COLORS = ['hsl(160, 79%, 41%)', 'hsl(220, 85%, 8%)', 'hsl(210, 22%, 73%)', 'hsl(215, 16%, 47%)', 'hsl(214, 31%, 91%)'];

export const BiodiversityCharts = () => {
  return (
    <div className="space-y-8">
      <Tabs defaultValue="taxonomy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="taxonomy">Taxonomy Distribution</TabsTrigger>
          <TabsTrigger value="trends">Biodiversity Trends</TabsTrigger>
          <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="taxonomy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 glass">
              <h3 className="text-xl font-display font-semibold mb-4">Species Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taxonomyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                  >
                    {taxonomyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 glass">
              <h3 className="text-xl font-display font-semibold mb-4">Species Count by Group</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taxonomyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 31%, 91%)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(215, 16%, 47%)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(215, 16%, 47%)"
                    fontSize={12}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(160, 79%, 41%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {taxonomyData.map((item, index) => (
              <Card key={item.name} className="p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: COLORS[index] }}>
                  {item.count}
                </div>
                <div className="text-sm text-muted-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.percentage}%</div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6 glass">
            <h3 className="text-xl font-display font-semibold mb-4">
              Biodiversity Index Trends (2024)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={biodiversityTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 31%, 91%)" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                />
                <Tooltip />
                <Bar 
                  dataKey="shannon" 
                  fill="hsl(160, 79%, 41%)"
                  radius={[4, 4, 0, 0]}
                  name="Shannon Diversity"
                />
                <Bar 
                  dataKey="simpson" 
                  fill="hsl(220, 85%, 8%)"
                  radius={[4, 4, 0, 0]}
                  name="Simpson Index"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold mb-2">Shannon Diversity Index</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Measures species diversity taking into account both abundance and evenness
              </p>
              <div className="text-3xl font-bold text-emerald">2.4</div>
              <div className="text-sm text-muted-foreground">Average this year</div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-2">Simpson Dominance Index</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Measures the probability that two individuals belong to the same species
              </p>
              <div className="text-3xl font-bold text-accent">0.85</div>
              <div className="text-sm text-muted-foreground">Average this year</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card className="p-6 glass">
            <h3 className="text-xl font-display font-semibold mb-4">
              Regional Biodiversity Comparison
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 31%, 91%)" />
                <XAxis 
                  dataKey="region" 
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                />
                <Tooltip />
                <Bar 
                  dataKey="species" 
                  fill="hsl(160, 79%, 41%)"
                  radius={[4, 4, 0, 0]}
                  name="Species Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {regionData.map((region) => (
              <Card key={region.region} className="p-4 text-center hover-lift">
                <h4 className="font-semibold mb-2">{region.region}</h4>
                <div className="text-2xl font-bold text-emerald mb-1">
                  {region.species}
                </div>
                <div className="text-sm text-muted-foreground">species</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {region.samples} samples
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Interactive Features Note */}
      <Card className="p-6 text-center bg-muted/30">
        <h4 className="font-display font-semibold mb-2">Interactive Features</h4>
        <p className="text-sm text-muted-foreground">
          In a production environment, these charts would be interactive with filtering, 
          zooming, and real-time data updates from your eDNA analysis pipeline.
        </p>
      </Card>
    </div>
  );
};