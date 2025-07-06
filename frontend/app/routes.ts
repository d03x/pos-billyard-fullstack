import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/Login.tsx"),
  route("register", "routes/Register.tsx"),
  layout("layouts/Layouts.tsx", [
    index("routes/home.tsx"),
    route("billyard", "routes/Billiard.tsx"),
    route('cafe', 'routes/Cafe.tsx'),
    route('profile', 'routes/Profile.tsx'),
  ]),
] satisfies RouteConfig;
