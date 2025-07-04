// components/charts/HourlyUsageChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as Card from "~/components/ui/card"
export function HourlyUsageChart({ data }) {
  return (
    <Card.Card>
      <Card.CardHeader>
        <Card.CardTitle>Penggunaan Meja Per Jam</Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="bookings" fill="#8884d8" name="Jumlah Booking" />
          </BarChart>
        </ResponsiveContainer>
      </Card.CardContent>
    </Card.Card>
  );
}