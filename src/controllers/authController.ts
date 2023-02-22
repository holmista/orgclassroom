import type express from 'express'
import Auth, { type tokens } from '../../lib/auth.js'
import type SocialClient from '../../lib/socialClient.js'
import GoogleClient from '../configs/googleClient.js'
import GithubClient from '../configs/githubClient.js'
import dotenv from 'dotenv'
import { type User } from '@prisma/client'
dotenv.config()

class GoogleAuth extends Auth {
  constructor (code: string) {
    super(code)
  }

  async getUserData (tokens: tokens): Promise<User> {
    try {
      const googleClient = GoogleClient.getInstance()
      const userData = await googleClient.getUser(
        tokens.access_token,
        tokens.id_token as string
      )
      if (!userData) throw new Error('Something went wrong')
      return await super.createUser({
        email: userData.email,
        name: userData.name,
        authProvider: 'google',
        authProviderId: userData.id
      })
    } catch (err: any) {
      throw new Error(err.message)
    }
  }
}

class GithubAuth extends Auth {
  constructor (code: string) {
    super(code)
  }

  async getUserData (tokens: tokens): Promise<User> {
    try {
      const githubClient = GithubClient.getInstance()
      const userData = await githubClient.getUser(tokens.access_token)
      if (!userData) throw new Error('Something went wrong')
      return await super.createUser({
        email: userData.primary_email,
        name: userData.login,
        authProvider: 'github',
        authProviderId: String(userData.id)
      })
    } catch (err: any) {
      throw new Error(err.message)
    }
  }
}

async function loginWithGoogle (req: express.Request, res: express.Response, client: SocialClient) {
  try {
    const code = req.body.code
    if (!code) return res.status(400).json({ message: 'No code provided' })
    const googleAuth = new GoogleAuth(code)
    const token = await googleAuth.login(client)
    res.status(200).cookie('token', token, Auth.cookieOptions).end()
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

async function loginWithGithub (
  req: express.Request,
  res: express.Response,
  client: SocialClient
) {
  try {
    const code = req.body.code
    if (!code) return res.status(400).json({ message: 'No code provided' })
    const githubAuth = new GithubAuth(code)
    const token = await githubAuth.login(client)
    res.status(200).cookie('token', token, Auth.cookieOptions).end()
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

async function logout (req: express.Request, res: express.Response) {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: 'No token provided' })
    await Auth.logout(token)
    res.status(200).clearCookie('token', Auth.cookieOptions).end()
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export { GoogleAuth, GithubAuth, loginWithGithub, loginWithGoogle, logout }
