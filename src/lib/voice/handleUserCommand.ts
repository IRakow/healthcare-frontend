import { RachelTTS } from '@/lib/voice/RachelTTS'

interface UserOptions {
  intent: string
}

export async function handleUserCommand(text: string, options: UserOptions) {
  const { intent } = options

  switch (intent) {
    case 'users.count':
      return RachelTTS.say('There are 12 admin users in the system. 8 have been active in the last 24 hours.')

    case 'users.createPrompt':
      return RachelTTS.say('To create a new user, I need their name, email, and role. What is the user\'s full name?')

    default:
      return RachelTTS.say('I can help with user management tasks like listing users or creating new accounts.')
  }
}