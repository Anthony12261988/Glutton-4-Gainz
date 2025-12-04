'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-sm border border-steel bg-gunmetal/95 p-3 shadow-lg">
      <p className="font-heading text-xs font-bold uppercase tracking-wide text-high-vis">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-tactical-red">
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  )
}

// Consistency Bar Chart Component
export interface ConsistencyData {
  week: string
  workouts: number
}

export interface ConsistencyChartProps {
  data: ConsistencyData[]
  title?: string
  description?: string
}

export function ConsistencyChart({
  data,
  title = 'WORKOUT CONSISTENCY',
  description = 'Weekly workout frequency',
}: ConsistencyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" opacity={0.3} />
            <XAxis
              dataKey="week"
              stroke="#A3A3A3"
              tick={{ fill: '#A3A3A3', fontSize: 12 }}
              tickLine={{ stroke: '#4a4a4a' }}
            />
            <YAxis
              stroke="#A3A3A3"
              tick={{ fill: '#A3A3A3', fontSize: 12 }}
              tickLine={{ stroke: '#4a4a4a' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1a1a1a' }} />
            <Bar
              dataKey="workouts"
              name="Workouts"
              fill="#D32F2F"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Weight Tracking Line Chart Component
export interface WeightData {
  date: string
  weight: number
}

export interface WeightChartProps {
  data: WeightData[]
  title?: string
  description?: string
}

export function WeightChart({
  data,
  title = 'WEIGHT TRACKER',
  description = 'Body weight progression',
}: WeightChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#A3A3A3"
              tick={{ fill: '#A3A3A3', fontSize: 12 }}
              tickLine={{ stroke: '#4a4a4a' }}
            />
            <YAxis
              stroke="#A3A3A3"
              tick={{ fill: '#A3A3A3', fontSize: 12 }}
              tickLine={{ stroke: '#4a4a4a' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D32F2F', strokeWidth: 2 }} />
            <Line
              type="monotone"
              dataKey="weight"
              name="Weight (lbs)"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#0a0a0a', strokeWidth: 2 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// XP Progress Line Chart Component
export interface XPData {
  date: string
  xp: number
}

export interface XPChartProps {
  data: XPData[]
  title?: string
  description?: string
}

export function XPChart({
  data,
  title = 'XP PROGRESSION',
  description = 'Experience points over time',
}: XPChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#A3A3A3"
              tick={{ fill: '#A3A3A3', fontSize: 12 }}
              tickLine={{ stroke: '#4a4a4a' }}
            />
            <YAxis
              stroke="#A3A3A3"
              tick={{ fill: '#A3A3A3', fontSize: 12 }}
              tickLine={{ stroke: '#4a4a4a' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D32F2F', strokeWidth: 2 }} />
            <Line
              type="monotone"
              dataKey="xp"
              name="Total XP"
              stroke="#D32F2F"
              strokeWidth={3}
              dot={{ fill: '#D32F2F', r: 4 }}
              activeDot={{ r: 6, fill: '#D32F2F', stroke: '#0a0a0a', strokeWidth: 2 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
