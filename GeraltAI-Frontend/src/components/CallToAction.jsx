import Image from 'next/image'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import backgroundImage from '@/images/background-call-to-action.jpg'
import { useInView } from 'react-intersection-observer'
import { delay, motion } from 'framer-motion'

export function CallToAction() {
  const { ref, inView } = useInView({
    threshold: 0.3,
  })

  const variants = {
    hidden: { opacity: 0, x: '100%' },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.75,
      },
    },
  }
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.5,
      },
    },
  }
  return (
    <motion.section
      id="about_id"
      aria-label="Features for running your books"
      className="relative overflow-hidden rounded-4xl bg-blue-600 py-16 shadow-2xl shadow-blue-600"
      variants={container}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      ref={ref}
    >
      <motion.div
        className="relative max-w-screen-xl sm:flex"
        ref={ref}
        variants={variants}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        <div className="p-10 sm:w-1/2">
          <div className="image object-center text-center">
            <img src="https://i.imgur.com/WbQnbas.png" />
          </div>
        </div>
        <div className="flex h-full flex-col gap-8 p-5 pt-24 text-white sm:w-3/4">
          <h2 className="my-4 self-start text-4xl  font-bold sm:text-6xl">
            About <span className="text-slate-900 ">Our Project</span>
          </h2>
          <p className="text-2xl tracking-tighter ">
            In an era marked by technological advancements, the need for
            efficient gate management systems in educational institutions has
            become paramount. Traditional methods often rely on manual roll
            calls or sign-in sheets, which can be time-consuming, prone to
            errors, and susceptible to fraud. GeraltAI leverages video
            surveillance and real-time recognition capabilities to identify
            students and record their In-time and Out-time electronically.
          </p>
        </div>
      </motion.div>
    </motion.section>
  )
}
