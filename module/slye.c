extern void register_component(char *name, void init());
extern void slog(char *msg);

void text_init()
{
        slog("Hey!");
}

int init()
{
        register_component("text", text_init);
}
