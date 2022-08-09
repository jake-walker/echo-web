import { Avatar, Box, Group, Stack, Text } from "@mantine/core"
import { ChatMessage } from "../middleware/chat"

interface MessageProps {
  message: ChatMessage
}

function Message(props: MessageProps) {
  return (
    <Stack spacing={0} sx={{ flexGrow: 1, flexShrink: 1 }}>
      <Text>
        <Text component="span" color={props.message.color}>{props.message.author}</Text>
        {' '}
        <Text component="span" size="sm" my="auto" color="dimmed">at {props.message.date.toLocaleString()}</Text>
      </Text>
      <Text sx={{ whiteSpace: "pre-wrap" }}>
        {props.message.content}
      </Text>
    </Stack>
  )
}

export default Message
