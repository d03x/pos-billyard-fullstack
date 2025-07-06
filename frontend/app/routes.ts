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
<<<<<<< HEAD
    route('profile', 'routes/Profile.tsx'),
=======
>>>>>>> 350692f395254902afa94fc75a3349ee1aca5cdf
  ]),
] satisfies RouteConfig;
