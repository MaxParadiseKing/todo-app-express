import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/tasks/all', userController.getAllTasksWithUsers);
router.get('/:id/tasks', userController.getUserWithTasks);

export default router;

// import { Router } from 'express';
// import * as userController from '../controllers/userController';

// const router = Router();

// router.post('/', userController.createUser);
// router.get('/', userController.getAllUsers);
// router.get('/tasks/all', userController.getAllTasksWithUsers);  // все задачи с пользователями
// router.get('/:id/tasks', userController.getUserWithTasks);      // задачи конкретного пользователя  ← ЭТОТ

// export default router;