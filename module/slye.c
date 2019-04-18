extern void register_component(char *name, void init());

void text_init()
{
}

int init()
{
        register_component("text", text_init);
}
