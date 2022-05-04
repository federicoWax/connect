import { Route, Routes } from "react-router-dom";
import RoterChecker from "../components/RouterCheker";
import routes from "./routes";
import { Suspense } from 'react';
import FullLoader from "../components/FullLoader"

const MyRouter = () => {
  return (
    <Suspense fallback={<FullLoader />}>
      <Routes>
        <Route path="/" element={<RoterChecker />}>
        {
          routes.map(r => (
            <Route {...r} />
          ))
        }
        </Route>
      </Routes>
    </Suspense>
  )
}

export default MyRouter;