import { Avatar, Box, Group, Stack, Text } from "@mantine/core"

function Message() {
  return (
    <Group sx={{ flexWrap: "nowrap" }}>
      <Avatar color="cyan" radius="xl" sx={{ flexGrow: 0, flexShrink: 0, marginBottom: "auto" }}>LS</Avatar>
      <Stack spacing="xs" sx={{ flexGrow: 1, flexShrink: 1 }}>
        <Text>
          Author
          {' '}
          <Text component="span" size="sm" my="auto" color="dimmed">at 4:13pm</Text>
        </Text>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus nemo nisi saepe quasi eaque laudantium autem aliquid eligendi, nihil aut id sunt iusto nulla. Modi ut provident obcaecati quibusdam veritatis?
        </Text>
      </Stack>
    </Group>
  )
}

export default Message
