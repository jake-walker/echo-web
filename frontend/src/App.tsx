import { AppShell, Box, Button, Grid, Group, Input, Stack, TextInput } from "@mantine/core"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import ChannelList from "./components/ChannelList"
import Header from "./components/Header"
import MemberList from "./components/MemberList"
import Message from "./components/Message"
import { chatActions } from "./slices/chat"
import { RootState } from "./store"

function App() {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const currentChannel = useSelector((state: RootState) => state.chat.currentChannel);
  const messages = useSelector((state: RootState) => state.chat.messages);

  const chatDisabled = currentChannel === null;

  const sendMessage = () => {
    dispatch(chatActions.sendMessage({ content: message }));
    setMessage("");
  }

  return (
    <AppShell
      padding={0}
      navbarOffsetBreakpoint="sm"
      navbar={<ChannelList hidden={!opened} />}
      header={<Header opened={opened} setOpened={setOpened} />}
      aside={<MemberList />}
    >
      <Stack sx={{ height: "calc(100vh - 60px)" }} spacing={0}>
        <Stack sx={{ overflowY: "auto", flexGrow: 1, flexShrink: 0 }} p="md">
          {messages.map((msg, i) => (
            <Message key={`msg${i}`} message={msg} />
          ))}
        </Stack>
        <Group p="md" sx={(theme) => ({ borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`, flexGrow: 0, flexShrink: 0 })}>
          <TextInput sx={{ flexGrow: 1 }} placeholder="Message" disabled={chatDisabled} value={message} onChange={(event) => setMessage(event.target.value)} onKeyUp={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}/>
          <Button disabled={chatDisabled} onClick={() => sendMessage()}>Send</Button>
        </Group>
      </Stack>
    </AppShell>
  )
}

export default App
