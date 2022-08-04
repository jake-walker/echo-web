import { AppShell, Box, Grid, Stack } from "@mantine/core"
import ChannelList from "./components/ChannelList"
import Header from "./components/Header"
import MemberList from "./components/MemberList"
import Message from "./components/Message"

function App() {
  return (
    <AppShell
      padding="md"
      navbar={<ChannelList />}
      header={<Header />}>
      <Grid>
        <Grid.Col span={10}>
          <Stack sx={{ overflowY: "scroll" }}>
            {[...Array(10)].map((e, i) => (
              <Message />
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={2}>
          <MemberList />
        </Grid.Col>
      </Grid>
    </AppShell>
  )
}

export default App
