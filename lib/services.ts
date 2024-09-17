import { OpenAI } from 'openai'
import { PrismaClient } from '@prisma/client'

export const openai = new OpenAI()
export const db = new PrismaClient()
