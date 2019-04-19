extern void register_component(char *name, void init());
extern void slog(char *msg);
extern void on_render(void render(int));

void text_render(int frame)
{
        slog("Render");
}

void text_init()
{
        slog("Hey!");
        on_render(text_render);
}

int init()
{
        register_component("text", text_init);
}
