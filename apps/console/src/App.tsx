import { useState } from 'react';
import { applicationIds } from '@cyrantis/core/contracts';
import {
  AppShell,
  Badge,
  Burger,
  Container,
  Group,
  MantineProvider,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  createTheme,
} from '@mantine/core';
import '@mantine/core/styles.css';
import './styles.css';

const theme = createTheme({
  primaryColor: 'teal',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: { fontFamily: 'Inter, system-ui, sans-serif' },
  defaultRadius: 'md',
});

const components = [
  {
    id: applicationIds.control,
    title: 'Control API',
    detail: 'The home for identity and administration.',
    number: '01',
  },
  {
    id: applicationIds.gateway,
    title: 'Gateway API',
    detail: 'The home for provider execution.',
    number: '02',
  },
  {
    id: applicationIds.console,
    title: 'Console',
    detail: 'One workspace to bring it together.',
    number: '03',
  },
] as const;

export function App() {
  const [opened, setOpened] = useState(false);
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AppShell
        header={{ height: 76 }}
        navbar={{ width: 236, breakpoint: 'sm', collapsed: { mobile: !opened } }}
        padding={0}
      >
        <AppShell.Header>
          <Group h="100%" px="lg" justify="space-between">
            <Group gap="sm">
              <Burger
                opened={opened}
                onClick={() => setOpened(!opened)}
                hiddenFrom="sm"
                size="sm"
                aria-label="Toggle navigation"
                aria-expanded={opened}
                aria-controls="workspace-navigation"
              />
              <span className="brand-mark" aria-hidden="true">
                C
              </span>
              <Text fw={750} size="lg">
                cyrantis<span className="brand-dot">.</span>
              </Text>
              <Text size="sm" c="dimmed" visibleFrom="sm">
                Console
              </Text>
            </Group>
            <Badge variant="light" color="teal" radius="sm">
              Workspace foundation
            </Badge>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar p="md" id="workspace-navigation">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb="sm">
            Workspace
          </Text>
          <nav aria-label="Workspace">
            <a
              className="nav-link active"
              href="#main"
              onClick={() => setOpened(false)}
              aria-current="page"
            >
              Foundation
            </a>
            <a className="nav-link" href="#components" onClick={() => setOpened(false)}>
              Components
            </a>
            <a className="nav-link" href="#next" onClick={() => setOpened(false)}>
              Next steps
            </a>
          </nav>
          <div className="sidebar-note">
            <Text size="xs" c="dimmed">
              PR01A
            </Text>
            <Text size="sm" fw={600}>
              Start with a clear foundation.
            </Text>
          </div>
        </AppShell.Navbar>
        <AppShell.Main id="main" tabIndex={-1}>
          <Container size="lg" py={{ base: 36, md: 72 }} px={{ base: 'lg', md: 48 }}>
            <Stack gap={40}>
              <div>
                <Text className="eyebrow" mb="sm">
                  CYRANTIS LLM GATEWAY
                </Text>
                <Title order={1} className="hero-title">
                  A clear foundation.
                  <br />
                  Room to build.
                </Title>
                <Text size="lg" c="dimmed" mt="lg" maw={600}>
                  Two independent APIs. One shared core. A workspace built to grow with clear
                  responsibilities.
                </Text>
              </div>
              <Paper p="lg" className="foundation-note" withBorder>
                <Group align="flex-start" wrap="nowrap">
                  <ThemeIcon color="teal" variant="light" size="lg" aria-hidden="true">
                    i
                  </ThemeIcon>
                  <div>
                    <Text fw={650}>The workspace is taking shape.</Text>
                    <Text size="sm" c="dimmed" mt={4}>
                      This is the application shell. Sign-in, provider connections and inference
                      will arrive in later development steps.
                    </Text>
                  </div>
                </Group>
              </Paper>
              <section id="components" aria-labelledby="components-heading">
                <Group justify="space-between" mb="lg">
                  <Title order={2} id="components-heading" size="h3">
                    Three focused components
                  </Title>
                  <Text size="xs" c="dimmed">
                    SHARED DEFINITIONS · INDEPENDENT APPS
                  </Text>
                </Group>
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                  {components.map((component) => (
                    <Paper key={component.id} className="component-card" withBorder p="xl">
                      <Text className="component-number">{component.number}</Text>
                      <Title order={3} size="h4" mt="xl">
                        {component.title}
                      </Title>
                      <Text c="dimmed" size="sm" mt="sm">
                        {component.detail}
                      </Text>
                      <code className="component-id">{component.id}</code>
                    </Paper>
                  ))}
                </SimpleGrid>
              </section>
              <section id="next" className="next-step" aria-labelledby="next-heading">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Up next · PR01B
                </Text>
                <Title order={2} id="next-heading" size="h3" mt="sm">
                  An environment to run independently.
                </Title>
                <Text size="sm" c="dimmed" mt="sm">
                  Container images, local infrastructure and runtime checks follow the workspace
                  foundation.
                </Text>
              </section>
              <Text size="xs" c="dimmed">
                Cyrantis Console · Workspace Foundation
              </Text>
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
