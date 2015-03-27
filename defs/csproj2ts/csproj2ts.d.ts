declare module 'csproj2ts' {
    interface TypeScriptSettings extends TypeScriptConfiguration {
        VSProjectDetails?: VSProjectDetails;
        files?: string[];
    }
    interface VSProjectParams {
        ProjectFileName?: string;
        MSBuildExtensionsPath32?: string;
        VisualStudioVersion?: string;
        TypeScriptVersion?: string;
        ActiveConfiguration?: string;
    }
    interface VSProjectDetails extends VSProjectParams {
        DefaultProjectConfiguration?: string;
        DefaultVisualStudioVersion?: string;
        TypeScriptDefaultPropsFilePath?: string;
        TypeScriptDefaultConfiguration?: TypeScriptConfiguration;
    }
    interface TypeScriptConfiguration {
        AdditionalFlags?: string;
        Charset?: string;
        CodePage?: string;
        CompileOnSaveEnabled?: boolean;
        EmitBOM?: boolean;
        GeneratesDeclarations?: boolean;
        MapRoot?: string;
        ModuleKind?: string;
        NoEmitOnError?: boolean;
        NoImplicitAny?: boolean;
        NoLib?: boolean;
        NoResolve?: boolean;
        OutFile?: string;
        OutDir?: string;
        PreserveConstEnums?: boolean;
        RemoveComments?: boolean;
        SourceMap?: boolean;
        SourceRoot?: string;
        SuppressImplicitAnyIndexErrors?: boolean;
        Target?: string;
    }
    var xml2jsReadXMLFile: (fileName: string) => Promise<any>;
    var getTypeScriptSettings: (projectInfo: VSProjectParams) => Promise<TypeScriptSettings>;
    var normalizePath: (path: string, settings: TypeScriptSettings) => string;
    var getTypeScriptDefaultsFromPropsFileOrDefaults: (settings: TypeScriptSettings) => Promise<TypeScriptConfiguration>;
    var programFiles: () => string;
}