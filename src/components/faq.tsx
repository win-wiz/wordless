import { EmailLink } from "./email-link"

export default function FAQ() {

  const arrs: Record<string, React.ReactNode>[] = [
    {
      "question": "How do I know if my guess is correct?",
      "answer": "After each guess, the letters will change color to give you hints. Green means the letter is correct and in the right spot, yellow means the letter exists but is in the wrong position, and gray means the letter isn't in the word at all."
    },
    {
      "question": "Can I play the same word multiple times?",
      "answer": `Yes! You can play as many times as you want. Use the "Reset" button to start a new game with a different word. Each game generates a new random word based on your chosen length.`
    },
    {
      "question": "How do I adjust the difficulty?",
      "answer": `Use the "+" and "-" buttons before starting a game to change the word length from 3 to 8 letters. Longer words generally provide a greater challenge. You can also track your solving time to challenge yourself.`
    },
    {
      "question": "What happens if I run out of tries?",
      "answer": `If you don't guess the word within 6 attempts, the game ends and reveals the correct word. Don't worry though - you can always start a new game and try again with a different word!`
    },
    {
      "question": "Can I use the keyboard to type my guesses?",
      "answer": `Yes! You can use either your physical keyboard or the on-screen keyboard to enter letters. Use Backspace to delete and Enter to submit your guess. The game supports both input methods for your convenience.`
    },
    {
      "question": "Are all words in English?",
      "answer": `Yes, all words are common English words. We've carefully selected words that are familiar and frequently used, making the game both challenging and educational for English language learners and native speakers alike.`
    },
    {
      "question": "What is the best word to start the game?",
      "answer": `At the beginning of the game, try to use a word without repeating letters and with as many vowels as possible, such as the word "RADIO". However, mathematician Grant Sanderson found that the best starting word is "CRANE" or "SLOTH", which includes frequently used letters.`
    },
    {
      "question": "What dictionary are you using?",
      "answer": `In American English, we use a dictionary from the Letterpress word list that includes a list of ~275,000 words. This dictionary is constantly updated with new words based on real feedback from people.`
    },
    {
      "question": "Why did I get a 'Word not found' message?",
      "answer": <>This alert message means that the given word was not found in our word bank. Try another word, or if you think the word is correct, <EmailLink>let us know</EmailLink>.</>
    },
    {
      "question": "The hidden word was incorrect. Can you fix this?",
      "answer": <>If you think that the hidden word is wrong or incorrect, <EmailLink>let us know</EmailLink>. We will definitely fix this as soon as possible.</>
    }

  ]
  return (
    <div className="grid gap-4 md:gap-6">
      {arrs.map((item, index) => (
        <div key={`faq-${index}`} className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <span className="flex-none w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-4">Q</span>
            <h3 className="text-lg font-semibold text-zinc-800">
              {item.question}
            </h3>
          </div>
          <p className="text-zinc-600 ml-12">
            {item.answer}
          </p>
        </div>
      ))}
    </div>
  )
}
