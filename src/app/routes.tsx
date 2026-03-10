
import { createBrowserRouter } from "react-router";

import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";

import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherArticles from "./pages/teacher/Articles";
import ArticleForm from "./pages/teacher/ArticleForm";
import TeacherAnalytics from "./pages/teacher/Analytics";

import StudentDashboard from "./pages/student/Dashboard";
import StudentArticleList from "./pages/student/ArticleList";
import ArticleReader from "./pages/student/ArticleReader";
import ErrorPage from "./pages/ErrorPage";

// components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router";
import { ROLES, ROUTES } from "./utils/constants";
import { useAuth } from "./context/AuthContext";

interface Props {
  role?: ROLES;
}

function ProtectedRoute({ role }: Props) {
  const { authUser } = useAuth();

  if (!authUser?.token) {
    return <Navigate to="/login" replace />;
  }

  if (role && authUser?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}


function PublicRoute() {
  const { authUser } = useAuth();

  if (authUser?.token) {
    return <Navigate to={`/${authUser?.role}/dashboard`} replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={ROUTES.LOGIN} />,
    errorElement: <ErrorPage />,
  },

  // PUBLIC ROUTES
  {
    Component: PublicRoute,
    errorElement: <ErrorPage />,
    children: [
      { path: "/login", Component: Login },
      { path: "/register", Component: Register },
    ],
  },

  // TEACHER ROUTES
  {
    path: "/teacher",
    Component: ProtectedRoute,
    errorElement: <ErrorPage />,
    children: [
      {
        Component: TeacherLayout,
        children: [
          { index: true, Component: TeacherDashboard },
          { path: "dashboard", Component: TeacherDashboard },
          { path: "articles", Component: TeacherArticles },
          { path: "articles/new", Component: ArticleForm },
          { path: "articles/:id/edit", Component: ArticleForm },
          { path: "analytics", Component: TeacherAnalytics },
        ],
      },
    ],
  },

  // STUDENT ROUTES
  {
    path: "/student",
    Component: ProtectedRoute,
    errorElement: <ErrorPage />,
    children: [
      {
        Component: StudentLayout,
        children: [
          { index: true, Component: StudentDashboard },
          { path: "dashboard", Component: StudentDashboard },
          { path: "articles", Component: StudentArticleList },
          { path: "articles/:id", Component: ArticleReader },
        ],
      },
    ],
  },

  {
    path: "*",
    Component: NotFound,
  },
]);
