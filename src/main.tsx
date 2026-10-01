import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import BackSoon from './BackSoon';
import {MotionConfig} from 'framer-motion';
import './styles.css';
import './matte.css';

// Set to false to bring the storefront back.
const TEMPORARILY_CLOSED = true;

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><MotionConfig reducedMotion="user">{TEMPORARILY_CLOSED ? <BackSoon/> : <BrowserRouter><App/></BrowserRouter>}</MotionConfig></React.StrictMode>);
