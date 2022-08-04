import { AppShell, Box, Button, Grid, Group, Input, Stack } from "@mantine/core"
import { useState } from "react"
import ChannelList from "./components/ChannelList"
import Header from "./components/Header"
import MemberList from "./components/MemberList"
import Message from "./components/Message"

function App() {
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      padding={0}
      navbarOffsetBreakpoint="sm"
      navbar={<ChannelList hidden={!opened} />}
      header={<Header opened={opened} setOpened={setOpened} />}
      aside={<MemberList />}
    >
      <Stack sx={{ maxHeight: "calc(100vh - 60px)" }} spacing={0}>
        <Stack sx={{ overflowY: "auto", flexGrow: 1 }} p="md">
          {[...Array(10)].map((e, i) => (
            <Message />
          ))}
        </Stack>
        <Group p="md" sx={(theme) => ({ borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`})}>
          <Input sx={{ flexGrow: 1 }} placeholder="Message" />
          <Button>Send</Button>
        </Group>
      </Stack>
    </AppShell>
  )
}

export default App
