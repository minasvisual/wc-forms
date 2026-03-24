"use client";
import React from 'react';
import { createWcFormsReact } from './react.js';

export const WcFormsReact = createWcFormsReact(React);
export const FormInput = WcFormsReact.FormInput;
export const FormControl = WcFormsReact.FormControl;
