import { Header as MHeader, Group, Text, MediaQuery, Burger, createStyles } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface HeaderProps {
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
}

const useStyles = createStyles((theme) => ({
  title: {
    [`@media (min-width: ${theme.breakpoints.sm}px)`]: {
      width: "180px"
    },
    [`@media (min-width: ${theme.breakpoints.md}px)`]: {
      width: "280px"
    }
  }
}))

function Header(props: HeaderProps) {
  const { classes } = useStyles();
  const channelName = useSelector((state: RootState) => state.chat.currentChannel);

  return (
    <MHeader height={60} p="md" sx={(theme) => ({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.blue[6],
      color: 'white'
    })}>
      <Group sx={{ height: "100%" }}>
        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
          <Burger
            opened={props.opened}
            onClick={() => props.setOpened((o) => !o)}
            color="white"
            size="sm" />
        </MediaQuery>
        <Text size="xl" my="auto" className={classes.title}>Echo Web</Text>
        <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
          <Text size="md" my="auto">{channelName}</Text>
        </MediaQuery>
      </Group>
    </MHeader>
  )
}

export default Header
