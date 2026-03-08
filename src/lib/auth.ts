import { NextAuthConfig, DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { env } from './env'
import { logAuthEvent } from './auth-logger'

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email',
          // Request access to public repositories only
          response_type: 'code',
          state: true // Enable CSRF protection
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await logAuthEvent('sign_in_attempt', {
          userId: user.id,
          email: user.email,
          provider: account?.provider,
          profileId: profile?.id
        })

        // Allow sign in
        return true
      } catch (error) {
        console.error('Sign in callback error:', error)
        await logAuthEvent('sign_in_error', {
          userId: user.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        return false
      }
    },
    async jwt({ token, account, profile, user }) {
      try {
        // Include additional user data in the token
        if (account && profile) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.githubId = profile.id
          token.username = (profile as any).login
          token.profileUrl = (profile as any).html_url
          token.avatarUrl = (profile as any).avatar_url

          await logAuthEvent('jwt_created', {
            userId: token.sub,
            username: token.username,
            provider: account.provider
          })
        }

        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        await logAuthEvent('jwt_error', {
          userId: token.sub,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        return token
      }
    },
    async session({ session, token }) {
      try {
        // Include additional data in the session
        if (token) {
          session.user.id = token.sub as string
          session.accessToken = token.accessToken as string
          session.user.username = token.username as string
          session.user.githubId = token.githubId as string
          session.user.profileUrl = token.profileUrl as string
          session.user.avatarUrl = token.avatarUrl as string

          await logAuthEvent('session_created', {
            userId: session.user.id,
            username: session.user.username,
            email: session.user.email
          })
        }

        return session
      } catch (error) {
        console.error('Session callback error:', error)
        await logAuthEvent('session_error', {
          userId: session.user?.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // Ensure redirects stay within our domain
        if (url.startsWith('/')) {
          await logAuthEvent('redirect', {
            from: url,
            to: `${baseUrl}${url}`
          })
          return `${baseUrl}${url}`
        } else if (new URL(url).origin === baseUrl) {
          await logAuthEvent('redirect', {
            from: url,
            to: url
          })
          return url
        }

        await logAuthEvent('redirect', {
          from: url,
          to: baseUrl
        })
        return baseUrl
      } catch (error) {
        console.error('Redirect callback error:', error)
        return baseUrl
      }
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      try {
        await logAuthEvent('sign_in_success', {
          userId: user.id,
          email: user.email,
          provider: account?.provider,
          isNewUser,
          username: (profile as any)?.login
        })
      } catch (error) {
        console.error('Sign in event error:', error)
      }
    },
    async signOut({ token, session }) {
      try {
        await logAuthEvent('sign_out', {
          userId: token?.sub || session?.user?.id,
          username: (token?.username || session?.user?.username) as string
        })
      } catch (error) {
        console.error('Sign out event error:', error)
      }
    },
    async createUser({ user }) {
      try {
        await logAuthEvent('user_created', {
          userId: user.id,
          email: user.email
        })
      } catch (error) {
        console.error('Create user event error:', error)
      }
    },
    async updateUser({ user }) {
      try {
        await logAuthEvent('user_updated', {
          userId: user.id,
          email: user.email
        })
      } catch (error) {
        console.error('Update user event error:', error)
      }
    },
    async linkAccount({ user, account, profile }) {
      try {
        await logAuthEvent('account_linked', {
          userId: user.id,
          provider: account.provider,
          providerAccountId: account.providerAccountId
        })
      } catch (error) {
        console.error('Link account event error:', error)
      }
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60 // 1 hour
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 // 24 hours
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: env.NODE_ENV === 'production'
      }
    }
  },
  trustHost: true,
  debug: env.NODE_ENV === 'development'
}

// Extended session type
declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      id: string
      username: string
      githubId: string
      profileUrl: string
      avatarUrl: string
    } & DefaultSession['user']
  }

  interface User {
    username: string
    githubId: string
    profileUrl: string
    avatarUrl: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    githubId: string
    username: string
    profileUrl: string
    avatarUrl: string
  }
}