import {Router} from 'express';
import {handleRequest} from '../controllers/itemController';

const router = Router();

router.get('/:first/:second', handleRequest);

export default router;

