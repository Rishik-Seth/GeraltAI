import Head from 'next/head'
import Link from 'next/link'

import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/Button'
import { SelectField, TextField } from '@/components/Fields'
import { Logo } from '@/components/Logo'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Webcam from 'react-webcam'
import axios from 'axios'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState('male')
  const router = useRouter()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  return (
    <>
      <Head>
        <title>Sign Up - GeraltAI</title>
      </Head>
      <AuthLayout>
        <div className="flex flex-col">
          <Link href="/" aria-label="Home">
            <Logo className="h-10 w-auto" />
          </Link>
          <div className="mt-20">
            <h2 className="text-lg font-semibold text-gray-900">
              Get started for free
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Already registered?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign in
              </Link>{' '}
              to your account.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
          <TextField
            label="First name"
            id="first_name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            setValue={setFirstName}
            required
          />
          <TextField
            label="Last name"
            id="last_name"
            name="last_name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            setValue={setLastName}
            required
          />
          <TextField
            className="col-span-full"
            label="Roll Number"
            type="text"
            value={rollNumber}
            setValue={setRollNumber}
            required
          />
          <TextField
            className="col-span-full"
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
            className="col-span-full"
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            setValue={setPassword}
            required
          />

          <TextField
            className="col-span-full"
            label="Phone Number"
            id="Phone_Number"
            name="Phone_Number"
            type="text"
            autoComplete="phone_number"
            value={phoneNumber}
            setValue={setPhoneNumber}
            required
          />
          <SelectField
            className="col-span-full"
            label="Gender"
            id="referral_source"
            name="referral_source"
            value={gender}
            setValue={setGender}
          >
            <option value={'male'}>Male</option>
            <option value={'female'}>Female</option>
          </SelectField>
          <div className="col-span-full">
            <Button
              type="submit"
              variant="solid"
              color="blue"
              className="w-full"
              onClick={() => {
                const Notification = toast.loading(
                  'Registering you, please wait...'
                )
                axios
                  .post(
                    `${backendUrl}/attendance/register/`,
                    {
                      name: firstName + ' ' + lastName,
                      email,
                      password,
                      roll_number: rollNumber,
                      gender,
                      phone_number: phoneNumber,
                    },
                    {
                      authorization: 'Bearer ' + localStorage.getItem('token'),
                    }
                  )
                  .then(function (response) {
                    localStorage.setItem('token', response.data.token)
                    window.location.href = '/user'
                    toast.update(Notification, {
                      render:
                        'Registered successfully! Redirecting you to your profile...',
                      type: 'success',
                      isLoading: false,
                      autoClose: 2000,
                    })
                  })
                  .catch(function (error) {
                    console.log(error)
                    toast.update(Notification, {
                      render:
                        error.response.data.message || 'An error occurred',
                      type: 'error',
                      isLoading: false,
                      autoClose: 2000,
                    })
                  })
              }}
            >
              <span>
                Sign up <span aria-hidden="true">&rarr;</span>
              </span>
            </Button>
          </div>
        </div>
      </AuthLayout>
    </>
  )
}
