import {Router} from 'express';
import {handleRequest, handleIndex} from '../controllers/itemController';

const router = Router();

router.get('/', handleIndex)
router.get('/:first/:second', handleRequest);

export default router;

