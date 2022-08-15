import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './routes/home';
import { AnimatePresence, motion } from 'framer-motion';

export default function Router() {
	const location = useLocation();

	return (
		<>
			<AnimatePresence initial={false} exitBeforeEnter>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{
						duration: 0.3,
						ease: 'easeInOut',
					}}
					key={location.pathname}
				>
					<Routes location={location}>
						<Route path='/'>
							<Route index element={<Home />} />
						</Route>
					</Routes>
				</motion.div>
			</AnimatePresence>
		</>
	);
}
