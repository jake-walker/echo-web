import { Avatar, Box, Group, Stack, Text } from "@mantine/core"
import { ChatMessage } from "../middleware/chat"

interface MessageProps {
  message: ChatMessage
}

function Message(props: MessageProps) {
  return (
    <Group sx={{ flexWrap: "nowrap" }}>
      <Avatar color={props.message.color} radius="xl" sx={{ flexGrow: 0, flexShrink: 0, marginBottom: "auto" }}>LS</Avatar>
      <Stack spacing="xs" sx={{ flexGrow: 1, flexShrink: 1 }}>
        <Text>
          {props.message.author}
          {' '}
          <Text component="span" size="sm" my="auto" color="dimmed">at {props.message.date}</Text>
        </Text>
        <Text>
          {props.message.content}
        </Text>
      </Stack>
    </Group>
  )
}

export default Message
