import { Button, Grid, PasswordInput, Select, SelectItem, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Check, X } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import { chatActions } from "../slices/chat";
import { RootState } from "../store";

function ConnectModal() {
  const dispatch = useDispatch();

  const stateBridgeUrl = useSelector((state: RootState) => state.chat.bridgeAddress);
  const stateServerId = useSelector((state: RootState) => state.chat.serverId);
  const stateUsername = useSelector((state: RootState) => state.chat.username);
  const statePassword = useSelector((state: RootState) => state.chat.password);

  const [bridgeUrl, setBridgeUrl] = useState(stateBridgeUrl);
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [availableServers, setAvailableServers] = useState<SelectItem[]>([]);
  const [serverId, setServerId] = useState<string | null>(stateServerId);

  const [currentBridgeUrl, setCurrentBridgeUrl] = useState("");

  const [credentials, setCredentials] = useState({
    username: stateUsername,
    password: statePassword
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({
    bridgeUrl: null,
    serverId: null,
    username: null,
    password: null
  });

  const saveBridgeUrl = async () => {
    setBridgeLoading(true);
    let bridgeInfo;

    try {
      bridgeInfo = await (await fetch(new URL('/info', bridgeUrl))).json();
    } catch (err: any) {
      setErrors({
        ...errors,
        bridgeUrl: `Failed to load bridge info: ${err.message}`
      });
      setBridgeLoading(false);
      return;
    }

    const servers = bridgeInfo.servers;

    setBridgeLoading(false);

    if (servers.length > 0) {
      setAvailableServers(servers.map((server: any) => ({
        label: server.name,
        value: server.id
      })));
      setServerId(servers[0].id);
    } else {
      setErrors({
        ...errors,
        bridgeUrl: "No servers available at this bridge"
      });
      return;
    }

    setErrors({
      ...errors,
      bridgeUrl: null
    });
    setCurrentBridgeUrl(bridgeUrl);
  }

  const save = () => {
    if (serverId === null) {
      showNotification({
        title: "Could not save",
        message: "A server has not been selected.",
        color: "red",
        icon: <X />
      });
      return;
    }

    dispatch(chatActions.setConnectionParameters({
      bridgeAddress: currentBridgeUrl,
      serverId,
      username: credentials.username,
      password: credentials.password
    }));

    showNotification({
      title: "Connection Settings Saved",
      message: "The connection settings have been saved.",
      color: "green",
      icon: <Check />
    });
  };

  const serverSelectDisabled = availableServers.length < 1 || bridgeLoading;
  const usernamePasswordDisabled = serverSelectDisabled || !serverId;

  useEffect(() => {
    saveBridgeUrl()
  }, []);

  return (
    <>
      <Text size="md" mb="sm">Connection Settings</Text>
      <Grid sx={{ alignItems: "flex-end" }}>
        <Grid.Col span={9}>
          <TextInput label="Bridge URL" required disabled={bridgeLoading} value={bridgeUrl} onChange={(e) => setBridgeUrl(e.target.value)} error={errors.bridgeUrl} />
        </Grid.Col>
        <Grid.Col span={3}>
          <Button fullWidth loading={bridgeLoading} onClick={saveBridgeUrl} disabled={bridgeUrl === currentBridgeUrl}>Set</Button>
        </Grid.Col>
      </Grid>
      <Select label="Server" required data={availableServers} value={serverId} onChange={setServerId} disabled={serverSelectDisabled} error={errors.serverId} />
      <TextInput label="Username" required disabled={usernamePasswordDisabled} error={errors.username} value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} />
      <PasswordInput label="Password" disabled={usernamePasswordDisabled} error={errors.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} />
      <Button mt="sm" sx={{ float: "right" }} onClick={save}>Save</Button>
    </>
  );
}

export default ConnectModal;
