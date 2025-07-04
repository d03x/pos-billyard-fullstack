import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/Layouts.tsx", [
    index("routes/home.tsx"),
    route("billyard", "routes/Billiard.tsx"),
    route('cafe', 'routes/Cafe.tsx'),
  ]),
] satisfies RouteConfig;
