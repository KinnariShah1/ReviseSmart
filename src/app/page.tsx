"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation'; // Correct import for App Router

export default function Home() {
  const router = useRouter();
  const handleClickCourse = () => {
    router.push('/create'); 
  };

  const handleClickQuiz = () => {
    router.push('/quiz'); 
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 background color:white">
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Image src="/images/main1.png" alt="App Logo" width={300} height={80} className="mx-auto" />
          <h1 className="mt-4 text-4xl font-bold text-gray-800 dark:text-gray-200">
            Welcome to Revise Smart
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Streamline your learning experience with AI-powered quiz and course creation.
          </p>
        </motion.div>

        {/* Call to Action Buttons */}
        <div className="flex gap-4 mt-6">
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button variant="default" className="px-6 py-2" onClick={handleClickQuiz}>
              Create Quiz
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button variant="default" className="px-6 py-2" onClick={handleClickCourse}>
              Create Course
            </Button>
          </motion.div>
        </div>

        {/* Animated Images/Icons for Features */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="p-4 transition transform bg-white shadow-lg rounded-xl"
          >
            <Image src="/images/quiz.gif" alt="Quiz Icon" width={150} height={100} />
            <p className="mt-4 font-semibold">Quiz Creation</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="p-4 transition transform bg-white shadow-lg rounded-xl"
          >
            <Image src="/images/course.gif" alt="Course Icon" width={150} height={100} />
            <p className="mt-4 font-semibold">Course Creation</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
