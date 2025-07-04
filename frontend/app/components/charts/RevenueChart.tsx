import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import * as Card from "~/components/ui/card"
import { formatRupiah } from "~/utils/formatRupiah";
export function RevenueChart({ data }) {
  return (
    <Card.Card>
      <Card.CardHeader>
        <Card.CardTitle>Tren Pendapatan</Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatRupiah(value)} />
            <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: 8 }} name="Pendapatan" />
          </LineChart>
        </ResponsiveContainer>
      </Card.CardContent>
    </Card.Card>
  );
}
