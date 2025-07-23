import { EmailLink } from "./email-link"

export default function FAQ() {

  const arrs: Record<string, React.ReactNode>[] = [
    {
      "question": "How do I know if my guess is correct?",
      "answer": "After each guess, letters change color to provide strategic hints. Green indicates the letter is correct and in the right position, yellow means the letter exists in the word but is in the wrong position, and gray shows the letter isn't in the target word at all. This color-coded feedback system makes Wordless Game both challenging and educational."
    },
    {
      "question": "Can I play the same word multiple times?",
      "answer": `Absolutely! Wordless Game offers unlimited gameplay. Use the "Reset" button to start a new challenge with a different word. Each session generates a new random word based on your chosen difficulty length, ensuring endless brain training opportunities.`
    },
    {
      "question": "How do I adjust the difficulty level?",
      "answer": `The game offers flexible difficulty settings. Use the "+" and "-" buttons before starting to change the word length from 3 to 8 letters. Longer words provide greater challenges for advanced players. You can also track your solving time to enhance your performance and cognitive skills.`
    },
    {
      "question": "What happens if I run out of tries?",
      "answer": `If you don't guess the word within 6 attempts, the game ends and reveals the correct answer. Don't worry though - Wordless Game encourages learning from each attempt. You can always start a new challenge and apply the strategies you've learned to improve your vocabulary skills!`
    },
    {
      "question": "Can I use the keyboard to type my guesses?",
      "answer": `Yes! Wordless Game supports both physical keyboard and on-screen keyboard input for maximum convenience. Use Backspace to delete letters and Enter to submit your guess. This dual input system makes the game accessible on both desktop and mobile devices.`
    },
    {
      "question": "Are all words in English?",
      "answer": `Yes, all words are common English words. We've carefully curated a comprehensive dictionary that includes familiar and frequently used words, making Wordless Game both challenging and educational for English language learners and native speakers alike.`
    },
    {
      "question": "What is the best starting word strategy?",
      "answer": `For optimal performance, start with words containing multiple vowels and no repeating letters, such as "RADIO" or "AUDIO". Research shows that starting words like "CRANE" or "SLOTH" are highly effective because they include frequently used letters, giving you maximum information for your Wordless Game strategy.`
    },
    {
      "question": "What dictionary does the game use?",
      "answer": `Wordless Game uses a comprehensive American English dictionary based on the Letterpress word list, containing approximately 275,000 words. This dictionary is constantly updated with new words based on real player feedback, ensuring the game remains current and challenging for all skill levels.`
    },
    {
      "question": "Why did I get a 'Word not found' message?",
      "answer": <>This alert means the entered word wasn't found in our comprehensive dictionary. Try another word for your guess, or if you believe the word should be accepted in Wordless Game, <EmailLink>let us know</EmailLink> and we'll review it for inclusion.</>
    },
    {
      "question": "The hidden word seems incorrect. Can you fix this?",
      "answer": <>If you believe the hidden word is wrong or inappropriate, <EmailLink>let us know</EmailLink>. We continuously improve Wordless Game quality and will address any issues as soon as possible to ensure the best gaming experience.</>
    }

  ]
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-zinc-800 mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
          Get answers to common questions about Wordless Game. Learn how to master strategies, 
          understand the rules, and improve your word puzzle skills with our comprehensive guide.
        </p>
      </div>
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
    </div>
  )
}
