import { Header as MHeader, Group, Text, Space } from '@mantine/core';

function Header() {
  return (
    <MHeader height={60} p="xs" sx={(theme) => ({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.blue[6],
      color: 'white'
    })}>
      <Group sx={{ height: "100%" }}>
        <Text size="xl" my="auto" sx={{ width: "280px" }}>Echo Web</Text>
        <Text size="md" my="auto">Channel 1</Text>
      </Group>
    </MHeader>
  )
}

export default Header
