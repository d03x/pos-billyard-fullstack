import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as Card from "~/components/ui/card"
export function TableUtilizationChart({ data }) {
  // Sort data by utilizationRate for better visualization
  const sortedData = [...data].sort((a, b) => b.utilizationRate - a.utilizationRate);

  return (
    <Card.Card>
      <Card.CardHeader>
        <Card.CardTitle>Tingkat Pemanfaatan Meja</Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart layout="vertical" data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <YAxis type="category" dataKey="tableName" width={100} />
            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
            <Bar dataKey="utilizationRate" fill="#8884d8" name="Pemanfaatan" />
          </BarChart>
        </ResponsiveContainer>
      </Card.CardContent>
    </Card.Card>
  );
}