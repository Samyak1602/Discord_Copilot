'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Button
            variant="outline"
            onClick={handleSignOut}
            className="text-red-400 hover:text-red-300 hover:bg-red-950 border-red-900"
        >
            Sign Out
        </Button>
    )
}
