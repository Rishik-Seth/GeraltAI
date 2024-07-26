import Head from 'next/head'
import Link from 'next/link'

import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/Button'
import { TextField } from '@/components/Fields'
import { Logo } from '@/components/Logo'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  return (
    <>
      <Head>
        <title>Sign In - GeraltAI</title>
      </Head>
      <AuthLayout>
        <div className="flex flex-col">
          <Link href="/" aria-label="Home">
            <Logo className="h-10 w-auto" />
          </Link>
          <div className="mt-20">
            <h2 className="text-lg font-semibold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Don’t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign up
              </Link>{' '}
              for a free trial.
            </p>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-8">
          <TextField
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            setValue={setEmail}
            required
          />
          <TextField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={password}
            setValue={setPassword}
            autoComplete="current-password"
            required
          />
          <div>
            <Button
              type="submit"
              variant="solid"
              color="blue"
              className="w-full"
              onClick={(e) => {
                Notification = toast.loading('Logging in...')
                axios
                  .post(
                    `${backendUrl}/attendance/login/`,
                    {
                      email: email,
                      password: password,
                    },
                    {
                      authorization: 'Bearer ' + localStorage.getItem('token'),
                    }
                  )
                  .then(function (response) {
                    toast.update(Notification, {
                      render: 'Logged in successfully!',
                      type: 'success',
                      isLoading: false,
                      autoClose: 2000,
                    })

                    localStorage.setItem('token', response.data.token)
                    window.location.href = '/user'
                  })
                  .catch(function (error) {
                    console.log(error)
                    toast.update(Notification, {
                      render: error.response.data.message,
                      type: 'error',
                      isLoading: false,
                      autoClose: 2000,
                    })
                  })
              }}
            >
              <span>
                Sign in <span aria-hidden="true">&rarr;</span>
              </span>
            </Button>
          </div>
        </div>
      </AuthLayout>
    </>
  )
}
